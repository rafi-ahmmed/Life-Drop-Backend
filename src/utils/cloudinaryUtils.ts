import type { UploadApiResponse } from "cloudinary";
import AppError from "../errors/appError.js";
import cloudinary from "../lib/cloudinary.js";
import { prisma } from "../lib/prisma.js";

export const uploadCloudinary = async (buffer: Buffer) => {
	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream({ resource_type: "auto" }, async (error, result) => {
					if (error) {
						console.log(error);
						return reject(error);
					}

					if (!result) {
						return reject(new AppError(500, "Cloudinary upload failed"));
					}

					resolve(result);
				})
				.end(buffer);
		},
	);

	return cloudinaryResult;
};

export const deletePreviousImage = async (publicId: string) => {
	await cloudinary.uploader.destroy(publicId);
};
