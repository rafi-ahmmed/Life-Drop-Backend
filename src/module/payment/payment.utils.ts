import { ofetch } from "ofetch";
import config from "../../config/index.js";

export const validatePayment = async (val_id: string) => {
	const response = await ofetch(
		`https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${config.ssl_store_id}&store_passwd=${config.ssl_store_password}&format=json`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	return response;
};



