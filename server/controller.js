const bcrypt = require("bcryptjs");

module.exports = {
  signup: (req, res) => {
    const { email, password } = req.body;
    const db = req.app.get("db");

    db.check_user_exists(email)
      .then((data) => {
        if (data[0]) {
          res.status(200).send("User with that email already exists");
        } else {
          const hash = bcrypt.hashSync(password, bcrypt.genSaltSync());
          db.create_user([email, hash])
            .then((data) => {
              delete data[0].user_password;
              req.session.user = data[0];
              res.status(200).send(req.session.user);
            })
            .catch((err) => res.status(500).send(err));
        }
      })
      .catch((err) => res.status(500).send(err));
  },
  login: (req, res) => {
    const { email, password } = req.body;
    const db = req.app.get("db");

    db.check_user_exists(email)
      .then((data) => {
        if (!data[0]) {
          res.status(200).send("User with that email does not exist");
        } else {
          const authenticated = bcrypt.compareSync(password, data[0].user_password);
          if (authenticated) {
            delete data[0].user_password;
            req.session.user = data[0];
            res.status(200).send(req.session.user);
          } else {
            res.status(401).send("Incorrect email or password");
          }
        }
      })
      .catch((err) => res.status(500).send(err));
  },
  logout: (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  },
  user: (req, res) => {
    if (req.session.user) {
      res.status(200).send(req.session.user);
    } else {
      res.status(401).send("Please log in");
    }
  }
};
