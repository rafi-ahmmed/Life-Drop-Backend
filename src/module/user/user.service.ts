import { prisma } from "../../lib/prisma.js";
import {
	deletePreviousImage,
	uploadCloudinary,
} from "../../utils/cloudinaryUtils.js";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {
	const currentUser = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			image: true,
			imagePublicId: true,
		},
	});

	const imgUploadResult = await uploadCloudinary(buffer);

	const updateUser = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			image: imgUploadResult.secure_url,
			imagePublicId: imgUploadResult.public_id,
		},
		omit: {
			password: true,
		},
	});

	if (currentUser?.imagePublicId && currentUser.image) {
		await deletePreviousImage(currentUser.imagePublicId);
	}

	return updateUser;
};

// const registerUser = async (payload: any) => {};

export const userServices = {
	uploadProfileImage,
};

// {
//   asset_id: 'f9f1aeac30946bd8a1cc835ce789c3ec',
//   public_id: 'eici6bzgknzisixymcff',
//   version: 1791878646,
//   version_id: 'a3a6f6bc7d2de6f88056b5f21bcb39fa',
//   signature: 'd4b8d08cffeae78ebd2d96a5086c2718097fa723',
//   width: 1000,
//   height: 1000,
//   format: 'avif',
//   resource_type: 'image',
//   created_at: '2026-10-13T08:04:06Z',
//   tags: [],
//   pages: 1,
//   bytes: 73762,
//   type: 'upload',
//   etag: '2204317eac381dbbd88ddf96856dd971',
//   placeholder: false,
//   url: 'http://res.cloudinary.com/dghtlkpri/image/upload/v1791878646/eici6bzgknzisixymcff.avif',
//   secure_url: 'https://res.cloudinary.com/dghtlkpri/image/upload/v1791878646/eici6bzgknzisixymcff.avif',
//   asset_folder: '',
//   display_name: 'eici6bzgknzisixymcff',
//   original_filename: 'file',
//   api_key: '874117193169133'
// }
