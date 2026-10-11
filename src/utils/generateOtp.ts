import { randomInt } from "crypto";

const generateOTP = (): string => {
	return randomInt(100000, 1000000).toString();
};

export default generateOTP;
