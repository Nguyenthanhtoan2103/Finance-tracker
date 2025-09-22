const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_BASE_URL || ('http://localhost:' + (process.env.PORT || 5000))}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        if (!email) return done(new Error('No email found in Google profile'), null);

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            username: profile.displayName || email.split('@')[0],
            email,
            // mark provider so you know this user created via google
            provider: 'google',
            // store a placeholder password (not used)
            password: 'google-oauth',
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const UserModel = require('../models/User');
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
