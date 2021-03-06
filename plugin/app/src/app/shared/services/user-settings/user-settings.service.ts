import { Injectable } from "@angular/core";
import { UserSettingsModel } from "../../../../../../shared/models/user-settings/user-settings.model";
import { UserSettingsDao } from "../../dao/user-settings/user-settings.dao";
import { ZoneDefinitionModel } from "../../models/zone-definition.model";
import { ZoneModel } from "../../../../../../shared/models/activity-data/zone.model";

@Injectable()
export class UserSettingsService {

	public static readonly MARK_LOCAL_STORAGE_CLEAR: string = "localStorageMustBeCleared";

	constructor(private _userSettingsDao: UserSettingsDao) {
	}

	/**
	 *
	 * @returns {Promise<UserSettingsModel>}
	 */
	public fetch(): Promise<UserSettingsModel> {
		return this.userSettingsDao.fetch();
	}

	/**
	 *
	 * @param {string} key
	 * @returns {Promise<Object>}
	 */
	public get<T>(key: string): Promise<T> {
		return this.userSettingsDao.get<T>(key);
	}

	/**
	 *
	 * @param {string} key
	 * @param value
	 * @returns {Promise<boolean>}
	 */
	public update(key: string, value: any): Promise<UserSettingsModel> {
		return this.userSettingsDao.update(key, value);
	}

	/**
	 *
	 * @param {string} path
	 * @param {number} value
	 * @returns {Promise<UserSettingsModel>}
	 */
	public updateNested(path: string, value: number): Promise<UserSettingsModel> {
		return this.userSettingsDao.updateNested(path, value);
	}

	/**
	 * Clear local storage on next reload
	 * @returns {Promise<UserSettingsModel>}
	 */
	public markLocalStorageClear(): Promise<UserSettingsModel> {
		console.log("Mark localStorage to be cleared on next strava.com load");
		return this.update(UserSettingsService.MARK_LOCAL_STORAGE_CLEAR, true);
	}

	/**
	 *
	 * @param {ZoneDefinitionModel} zoneDefinition
	 * @param {ZoneModel[]} zones
	 * @returns {Promise<ZoneModel[]>}
	 */
	public updateZones(zoneDefinition: ZoneDefinitionModel, zones: ZoneModel[]): Promise<ZoneModel[]> {

		return new Promise<ZoneModel[]>((resolve: Function, reject: Function) => {

			const path = "zones." + zoneDefinition.value;

			this.userSettingsDao.updateNested(path, zones).then((userSettings: UserSettingsModel) => {

				resolve(userSettings.zones[zoneDefinition.value]);

			}, error => {

				reject(error);

			});
		});
	}


	/**
	 *
	 * @returns {Promise<UserSettingsModel>}
	 */
	public reset(): Promise<UserSettingsModel> {
		return this.userSettingsDao.reset();
	}

	get userSettingsDao(): UserSettingsDao {
		return this._userSettingsDao;
	}

	set userSettingsDao(value: UserSettingsDao) {
		this._userSettingsDao = value;
	}

}
