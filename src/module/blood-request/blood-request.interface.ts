import type {
	BloodGroup,
	BloodRequestStatus,
} from "../../../prisma/generated/prisma/enums.js";

export interface MatchingOptions {
	exactLocation?: boolean;
	exactDistrict?: boolean;
}

export interface IBloodRequestFilterOptions {
	bloodGroup?: BloodGroup;
	location?: string;
	status?: BloodRequestStatus;
	urgency?: boolean;
	page?: number;
}
