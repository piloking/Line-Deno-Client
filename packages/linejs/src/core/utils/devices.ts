export type Device =
	| "DESKTOPWIN"
	| "DESKTOPMAC"
	//| "CHROMEOS"
	| "ANDROID"
	| "IOS"
	| "IOSIPAD"
	| "WATCHOS"
	| "WEAROS";

export interface DeviceDetails {
	device: Device;
	appVersion: string;
	systemName: string;
	systemVersion: string;
}

export function getDeviceDetails(
	device: Device,
	version?: string,
): DeviceDetails | null {
	let appVersion;
	let systemName;
	let systemVersion;
	systemVersion = "12.1.4";

	switch (device) {
		case "DESKTOPWIN":
			appVersion = version || "9.2.0.3403";
			systemName = "WINDOWS";
			systemVersion = "10.0.0-NT-x64";
			break;
		case "DESKTOPMAC":
			appVersion = version || "9.2.0.3402";
			systemName = "MAC";
			break;
		/*
		case "CHROMEOS":
			appVersion = appVersion = deviceMap[device]||"3.0.3";
			systemName = "Chrome_OS";
			systemVersion = "1";
			break;
		*/
		case "ANDROID":
			appVersion = version || "13.4.1";
			systemName = "Android OS";
			break;
		case "IOS":
			appVersion = appVersion = version || "13.3.0";
			systemName = "iOS";
			break;
		case "IOSIPAD":
			appVersion = version || "13.3.0";
			systemName = "iOS";
			break;
		case "WATCHOS":
			appVersion = version || "13.3.0";
			systemName = "Watch OS";
			break;
		case "WEAROS":
			appVersion = version || "13.4.1";
			systemName = "Wear OS";
			break;
		default:
			return null;
	}

	return { device, appVersion, systemName, systemVersion };
}
