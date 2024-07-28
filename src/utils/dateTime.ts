/** @format */

import { add0ToNumber } from "./add0ToNumber";


export class DateTime {
	static getDate = (date: any) => {
		const newDate = new Date(date);

		return `${add0ToNumber(newDate.getDate())}/${add0ToNumber(
			newDate.getMonth() + 1
		)}/${newDate.getFullYear()}`;
	};

	static getFullTimeString = (date: number) => {
		const newDate = new Date(date);

		return `${add0ToNumber(newDate.getHours())}:${add0ToNumber(
			newDate.getMinutes()
		)} ${add0ToNumber(newDate.getDate())}/${add0ToNumber(
			newDate.getMonth() + 1
		)}/${newDate.getFullYear()}`;
	};
}
