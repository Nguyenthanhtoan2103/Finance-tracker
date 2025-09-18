const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const Transaction = require("../models/transaction");

/**
 * Helper: lấy userId từ req.user (hỗ trợ req.user._id hoặc req.user.id)
 */
const getUserId = (req) => {
  if (!req.user) return null;
  return req.user._id || req.user.id || req.user;
};

/**
 * GET /api/reports/summary
 */
const getReportSummary = async (req, res) => {
  try {
    const userId = getUserId(req);
    const transactions = await Transaction.find({ user: userId });

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const balance = income - expense;

    res.json({ income, expense, balance });
  } catch (error) {
    res.status(500).json({ message: "Error generating summary", error: error.message });
  }
};

/**
 * GET /api/reports/pdf
 * Export PDF - table with proper column alignment, wrapping, paging, color highlight
 */
const exportPDF = async (req, res) => {
  try {
    const userId = getUserId(req);
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });

    // compute totals
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const balance = income - expense;

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    doc.pipe(res);

    // Title
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#1D4ED8").text("Finance Tracker Report", {
      align: "center",
    });
    doc.moveDown(0.5);

    // Summary block
    doc.font("Helvetica").fontSize(11).fillColor("#000000");
    doc.text(`Total Income: $${income.toLocaleString()}`, { continued: true });
    doc.fillColor("#EF4444").text(`   Total Expense: $${expense.toLocaleString()}`, { continued: true });
    doc.fillColor("#2563EB").text(`   Balance: $${balance.toLocaleString()}`);
    doc.moveDown(0.8);

    // Table layout config
    const margin = 40;
    const startX = margin;
    const pageWidth = doc.page.width - margin * 2;
    // columns: date, description, category, type, amount
    const colWidths = {
      date: 70,
      description: Math.floor(pageWidth * 0.45), // ~45% of content width
      category: 100,
      type: 60,
      amount: 80,
    };
    const tableWidth =
      colWidths.date + colWidths.description + colWidths.category + colWidths.type + colWidths.amount;

    // Header
    const headerY = doc.y + 4;
    const headerHeight = 22;
    doc.save();
    doc.rect(startX, headerY - 4, tableWidth, headerHeight).fill("#1D4ED8");
    doc.restore();

    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10);
    doc.text("Date", startX + 4, headerY, { width: colWidths.date - 8 });
    doc.text("Description", startX + colWidths.date + 4, headerY, { width: colWidths.description - 8 });
    doc.text("Category", startX + colWidths.date + colWidths.description + 4, headerY, {
      width: colWidths.category - 8,
    });
    doc.text(
      "Type",
      startX + colWidths.date + colWidths.description + colWidths.category + 4,
      headerY,
      { width: colWidths.type - 8 }
    );
    doc.text(
      "Amount",
      startX + colWidths.date + colWidths.description + colWidths.category + colWidths.type + 4,
      headerY,
      { width: colWidths.amount - 8, align: "right" }
    );

    let y = headerY + headerHeight + 6;

    // function to draw a single row (auto-wrap + compute height)
    const drawRow = (row, idx) => {
      const paddingY = 6;
      doc.font("Helvetica").fontSize(10);

      // measure heights for each cell (use same font/size)
      const dateH = doc.heightOfString(row.date, { width: colWidths.date - 8 });
      const descH = doc.heightOfString(row.description, { width: colWidths.description - 8 });
      const catH = doc.heightOfString(row.category, { width: colWidths.category - 8 });
      const typeH = doc.heightOfString(row.type, { width: colWidths.type - 8 });
      const amtH = doc.heightOfString(row.amount, { width: colWidths.amount - 8 });

      const maxH = Math.max(dateH, descH, catH, typeH, amtH, 12);
      const rowHeight = maxH + paddingY * 2;

      // page break if not enough space
      if (y + rowHeight > doc.page.height - margin - 30) {
        doc.addPage();
        // redraw header on new page
        const newHeaderY = margin;
        doc.save();
        doc.rect(startX, newHeaderY, tableWidth, headerHeight).fill("#1D4ED8");
        doc.restore();
        doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10);
        doc.text("Date", startX + 4, newHeaderY + 2, { width: colWidths.date - 8 });
        doc.text("Description", startX + colWidths.date + 4, newHeaderY + 2, {
          width: colWidths.description - 8,
        });
        doc.text("Category", startX + colWidths.date + colWidths.description + 4, newHeaderY + 2, {
          width: colWidths.category - 8,
        });
        doc.text(
          "Type",
          startX + colWidths.date + colWidths.description + colWidths.category + 4,
          newHeaderY + 2,
          { width: colWidths.type - 8 }
        );
        doc.text(
          "Amount",
          startX + colWidths.date + colWidths.description + colWidths.category + colWidths.type + 4,
          newHeaderY + 2,
          { width: colWidths.amount - 8, align: "right" }
        );
        y = newHeaderY + headerHeight + 8;
      }

      // alternate row background
      if (idx % 2 === 0) {
        doc.save();
        doc.rect(startX, y - 4, tableWidth, rowHeight).fillOpacity(0.06).fill("#000000");
        doc.restore();
      }

      // write cells
      const cellY = y;
      // Date
      doc.fillColor("#000000").font("Helvetica").text(row.date, startX + 4, cellY + 6, {
        width: colWidths.date - 8,
      });
      // Description
      doc.text(row.description, startX + colWidths.date + 4, cellY + 6, {
        width: colWidths.description - 8,
      });
      // Category
      doc.text(row.category, startX + colWidths.date + colWidths.description + 4, cellY + 6, {
        width: colWidths.category - 8,
      });
      // Type
      doc.text(row.type, startX + colWidths.date + colWidths.description + colWidths.category + 4, cellY + 6, {
        width: colWidths.type - 8,
      });
      // Amount (right aligned, colored)
      const amountX =
        startX +
        colWidths.date +
        colWidths.description +
        colWidths.category +
        colWidths.type +
        4;
      doc.fillColor(row.type === "income" ? "#10B981" : "#EF4444").text(row.amount, amountX, cellY + 6, {
        width: colWidths.amount - 8,
        align: "right",
      });
      doc.fillColor("#000000");

      y += rowHeight + 4;
    };

    // prepare rows data
    const rows = transactions.map((t) => ({
      date: t.date ? t.date.toISOString().slice(0, 10) : "-",
      description: t.description || "-",
      category: t.category || "-",
      type: t.type || "-",
      amount: `$${(t.amount || 0).toLocaleString()}`,
    }));

    // draw all rows
    for (let i = 0; i < rows.length; i++) {
      drawRow(rows[i], i);
    }

    // Footer (on last page)
    const footerY = doc.page.height - 40;
    doc.fontSize(10).fillColor("#6B7280").text(`Generated: ${new Date().toLocaleString()}`, margin, footerY, {
      align: "left",
    });
    doc.text("Finance Tracker", margin, footerY, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("exportPDF error:", error);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};

/**
 * GET /api/reports/excel
 */
const exportExcel = async (req, res) => {
  try {
    const userId = getUserId(req);
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Type", key: "type", width: 12 },
      { header: "Category", key: "category", width: 18 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Description", key: "description", width: 40 },
    ];

    // style header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1D4ED8" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // add rows
    transactions.forEach((t) => {
      const row = worksheet.addRow({
        date: t.date ? t.date.toISOString().slice(0, 10) : "",
        type: t.type || "",
        category: t.category || "",
        amount: t.amount || 0,
        description: t.description || "",
      });

      // amount numeric format
      row.getCell("amount").numFmt = "#,##0";

      // color the type cell
      if (t.type === "income") {
        row.getCell("type").font = { color: { argb: "FF10B981" } }; // green
      } else if (t.type === "expense") {
        row.getCell("type").font = { color: { argb: "FFEF4444" } }; // red
      }

      // set border for row cells
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: cell.col === 5 ? "left" : "center" };
      });
    });

    // auto filter
    worksheet.autoFilter = {
      from: "A1",
      to: "E1",
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("exportExcel error:", error);
    res.status(500).json({ message: "Error generating Excel", error: error.message });
  }
};

module.exports = { getReportSummary, exportPDF, exportExcel };
