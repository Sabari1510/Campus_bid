export const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const hashOtp = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

export const verifyOtp = async (hashedOtp, code) => {
  return await bcrypt.compare(code, hashedOtp);
};