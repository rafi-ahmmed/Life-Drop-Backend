import httpStatus from "http-status";
import config from "../config/index.js";
import AppError from "../errors/appError.js";
import { redisClient } from "./redis.js";

const getBkashIdToken = async () => {
	try {
		const IdTokenKey = "bkash:idToken";
		const refreshTokenKey = "bkash:refreshToken";

		let bkashIdToken = await redisClient.get(IdTokenKey);
		let bkashRefreshToken = await redisClient.get(refreshTokenKey);
		const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey);
		const bkashRefreshTokenTTL = await redisClient.ttl(refreshTokenKey);

		// ? If idToken TTl is not greater than 600 seconds or expired, but refresh token is found and TTl is grater than 600, use refresh token to get new id token
		if (
			(bkashIdTokenTTL <= 600 || !bkashIdToken) &&
			bkashRefreshToken &&
			bkashRefreshTokenTTL > 600
		) {
			// Get bkash refresh token
			const bkashRefreshTokenResult = await fetch(
				`${config.bkash_sandbox_url}/auth/refresh-token`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						username: config.bkash_sandbox_username,
						password: config.bkash_sandbox_password,
					},
					body: JSON.stringify({
						app_key: config.bkash_sandbox_app_key,
						app_secret: config.bkash_sandbox_app_secret,
						refresh_token: bkashRefreshToken,
					}),
				},
			);

			if (!bkashRefreshTokenResult.ok) {
				throw new AppError(
					httpStatus.INTERNAL_SERVER_ERROR,
					"Bkash Refresh token failed",
				);
			}
			const result = await bkashRefreshTokenResult.json();

			bkashIdToken = result.id_token;
			await redisClient.set(IdTokenKey, result.id_token, {
				expiration: {
					type: "EX",
					value: 60 * 60,
				},
			});
			return bkashIdToken;
		}

		// ? If idToken TTl is greater than 600 seconds, return id token from redis
		if (bkashIdTokenTTL > 600) {
			// console.log("Return from redis");
			return bkashIdToken;
		}

		// Get bkash id token
		const response = await fetch(
			`${config.bkash_sandbox_url}/auth/grant-token`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					username: config.bkash_sandbox_username,
					password: config.bkash_sandbox_password,
				},
				body: JSON.stringify({
					app_key: config.bkash_sandbox_app_key,
					app_secret: config.bkash_sandbox_app_secret,
				}),
			},
		);

		if (!response.ok) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Bkash Access token failed",
			);
		}
		const result = await response.json();

		// ? Set id token in redis
		await redisClient.set(IdTokenKey, result.id_token, {
			expiration: {
				type: "EX",
				value: 60 * 60,
			},
		});
		// ? Set refresh token in redis
		await redisClient.set(refreshTokenKey, result.refresh_token, {
			expiration: {
				type: "EX",
				value: 60 * 60 * 24 * 28,
			},
		});

		bkashIdToken = result.id_token;
		bkashRefreshToken = result.refresh_token;
		return bkashIdToken;
	} catch (error: any) {
		console.log(error.message);
	}
};

export default getBkashIdToken;
