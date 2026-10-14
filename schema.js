const Joi = require("joi");

const userSchema = Joi.object({
    username: Joi.string().required().trim(),

    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net']}
    }),

    password: Joi.string().trim().min(8)
})