import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { UserSettingsService } from "../../shared/services/user-settings/user-settings.service";
import { FitnessService } from "../shared/service/fitness.service";
import { UserSettingsModel } from "../../../../../common/scripts/models/UserSettings";
import { DayFitnessTrendModel } from "../shared/models/day-fitness-trend.model";
import { MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import * as _ from "lodash";
import { FitnessTrendComponent } from "../fitness-trend.component";

@Component({
	selector: "app-fitness-trend-table",
	templateUrl: "./fitness-trend-table.component.html",
	styleUrls: ["./fitness-trend-table.component.scss"]
})
export class FitnessTrendTableComponent implements OnInit, AfterViewInit {

	public static readonly SWIM_STRESS_SCORE_ENABLED: boolean = true;
	public static readonly CYCLING_POWER_STRESS_SCORE_ENABLED: boolean = true;

	public static readonly COLUMN_DATE: string = "date";
	public static readonly COLUMN_TYPES: string = "types";
	public static readonly COLUMN_ACTIVITIES: string = "activities";
	public static readonly COLUMN_TRAINING_IMPULSE_SCORE: string = "trainingImpulseScore";
	public static readonly COLUMN_POWER_STRESS_SCORE: string = "powerStressScore";
	public static readonly COLUMN_SWIM_STRESS_SCORE: string = "swimStressScore";
	public static readonly COLUMN_FINAL_STRESS_SCORE: string = "finalStressScore";
	public static readonly COLUMN_CTL: string = "ctl";
	public static readonly COLUMN_ATL: string = "atl";
	public static readonly COLUMN_TSB: string = "tsb";
	public static readonly COLUMN_LINKS: string = "links";

	public static readonly availableColumns: string[] = [
		FitnessTrendTableComponent.COLUMN_DATE,
		FitnessTrendTableComponent.COLUMN_TYPES,
		FitnessTrendTableComponent.COLUMN_ACTIVITIES,
		FitnessTrendTableComponent.COLUMN_TRAINING_IMPULSE_SCORE,
		FitnessTrendTableComponent.COLUMN_POWER_STRESS_SCORE,
		FitnessTrendTableComponent.COLUMN_SWIM_STRESS_SCORE,
		FitnessTrendTableComponent.COLUMN_FINAL_STRESS_SCORE,
		FitnessTrendTableComponent.COLUMN_CTL,
		FitnessTrendTableComponent.COLUMN_ATL,
		FitnessTrendTableComponent.COLUMN_TSB,
		FitnessTrendTableComponent.COLUMN_LINKS
	];

	public displayedColumns: string[];

	@ViewChild(MatPaginator)
	public matPaginator: MatPaginator;

	@ViewChild(MatSort)
	public matSort: MatSort;

	public cyclingFtp: number = null;
	public swimFtp: number = null;
	public dataSource: MatTableDataSource<DayFitnessTrendModel>;
	public searchText: string;

	constructor(private userSettingsService: UserSettingsService,
				private fitnessService: FitnessService) {
	}

	public ngOnInit(): void {
		this.setup();
		this.start();
	}

	/**
	 *
	 */
	private start() {

		this.userSettingsService.fetch().then((userSettings: UserSettingsModel) => {

			this.cyclingFtp = _.isNumber(userSettings.userFTP) ? userSettings.userFTP : null;
			this.swimFtp = _.isNumber(userSettings.userSwimFTP) ? userSettings.userSwimFTP : null;

			// Hide POWER_STRESS_SCORE and/or SWIM_STRESS_SCORE columns if respective athlete settings are not activated
			this.displayedColumns = _.filter(FitnessTrendTableComponent.availableColumns, (columnName: string) => {

				if (!this.cyclingFtp && columnName === FitnessTrendTableComponent.COLUMN_POWER_STRESS_SCORE
					|| !this.swimFtp && columnName === FitnessTrendTableComponent.COLUMN_SWIM_STRESS_SCORE) {
					return false;
				}
				return true;
			});

			return this.fitnessService.computeTrend(
				FitnessTrendTableComponent.CYCLING_POWER_STRESS_SCORE_ENABLED,
				this.cyclingFtp,
				FitnessTrendTableComponent.SWIM_STRESS_SCORE_ENABLED,
				this.swimFtp
			);

		}).then((fitnessTrendModels: DayFitnessTrendModel[]) => {

			fitnessTrendModels = this.prepareFitnessTrendModels(fitnessTrendModels);

			// Assign models to datasource
			this.dataSource.data = fitnessTrendModels;

		}, error => {
			console.error(error);
		});
	}

	/**
	 *
	 */
	private setup() {

		this.dataSource = new MatTableDataSource<DayFitnessTrendModel>();

		this.dataSource.sortingDataAccessor = (dayFitnessTrendModel: DayFitnessTrendModel, sortHeaderId: string) => {

			switch (sortHeaderId) {

				case FitnessTrendTableComponent.COLUMN_DATE:
					return dayFitnessTrendModel.timestamp;

				case FitnessTrendTableComponent.COLUMN_TYPES:
					return dayFitnessTrendModel.printTypes();

				case FitnessTrendTableComponent.COLUMN_ACTIVITIES:
					return dayFitnessTrendModel.printActivities();

				case FitnessTrendTableComponent.COLUMN_TRAINING_IMPULSE_SCORE:
					return dayFitnessTrendModel.trainingImpulseScore;

				case FitnessTrendTableComponent.COLUMN_POWER_STRESS_SCORE:
					return dayFitnessTrendModel.powerStressScore;

				case FitnessTrendTableComponent.COLUMN_SWIM_STRESS_SCORE:
					return dayFitnessTrendModel.swimStressScore;

				case FitnessTrendTableComponent.COLUMN_FINAL_STRESS_SCORE:
					return dayFitnessTrendModel.finalStressScore;

				case FitnessTrendTableComponent.COLUMN_CTL:
					return dayFitnessTrendModel.ctl;

				case FitnessTrendTableComponent.COLUMN_ATL:
					return dayFitnessTrendModel.atl;

				case FitnessTrendTableComponent.COLUMN_TSB:
					return dayFitnessTrendModel.tsb;

				default:
					throw new Error("sortHeaderId: " + sortHeaderId + " is not listed");

			}

		};
	}

	/**
	 *
	 * @param {DayFitnessTrendModel[]} fitnessTrendModels
	 * @returns {DayFitnessTrendModel[]}
	 */
	private prepareFitnessTrendModels(fitnessTrendModels: DayFitnessTrendModel[]): DayFitnessTrendModel[] {

		// Remove preview days
		fitnessTrendModels = _.filter(fitnessTrendModels, {
			previewDay: false,
		});

		// Sort by date desc
		fitnessTrendModels = _.sortBy(fitnessTrendModels, (dayFitnessTrendModel: DayFitnessTrendModel) => {
			return dayFitnessTrendModel.timestamp * -1;
		});
		return fitnessTrendModels;
	}


	/**
	 *
	 * @param {string} filterValue
	 */
	public applyFilter(filterValue: string): void {

		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
		this.dataSource.filter = filterValue;

	}

	/**
	 *
	 */
	public ngAfterViewInit(): void {
		this.dataSource.paginator = this.matPaginator;
		this.dataSource.sort = this.matSort;
	}

	/**
	 *
	 * @param {number[]} ids
	 */
	public onOpenActivities(ids: number[]): void {
		FitnessTrendComponent.openActivities(ids);
	}

}
