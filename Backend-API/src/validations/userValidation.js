const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).required(),
});

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((err) => ({
        parameter: err.context.label || err.context.key,
        error: err.message,
      }));
      return res.status(400).json({ error: messages });
    }
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  validateBody
};
