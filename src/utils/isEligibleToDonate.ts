const isEligibleToDonate = (lastDonatedAt: Date | null): boolean => {
	if (!lastDonatedAt) {
		return true;
	}

	const eligibleDate = new Date(lastDonatedAt);
	eligibleDate.setMonth(eligibleDate.getMonth() + 3);

	return new Date() >= eligibleDate;
};

export default isEligibleToDonate;
