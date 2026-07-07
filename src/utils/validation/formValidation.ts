const htmlPattern = /<[^>]*>|&lt;|&gt;|javascript:/i;

export const noHtmlValidation = (value: unknown) =>
  !htmlPattern.test(String(value ?? "")) || "HTML is not allowed";

export const emailValidation = {
  required: "Email address is required",
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Enter a valid email address",
  },
  validate: noHtmlValidation,
};

export const passwordValidation = {
  required: "Password is required",
  minLength: {
    value: 8,
    message: "Password must be at least 8 characters",
  },
};
