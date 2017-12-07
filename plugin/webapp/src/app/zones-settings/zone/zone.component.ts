import { Component, Input, OnInit } from "@angular/core";
import { IZone } from "../../../../../common/scripts/interfaces/IActivityData";
import { ZonesService } from "../shared/zones.service";
import { MatSnackBar } from "@angular/material";
import * as _ from "lodash";
import { ZoneChangeOrder } from "../shared/zone-change-order.model";
import { ZoneChangeWhisper } from "../shared/zone-change-whisper.model";
import { ZoneChangeType } from "./zone-change-type.model";
import { ZoneDefinition } from "../../shared/models/zone-definition.model";

@Component({
	selector: "app-zone",
	templateUrl: "./zone.component.html",
	styleUrls: ["./zone.component.scss"]
})
export class ZoneComponent implements OnInit {

	@Input("zone")
	public zone: IZone;

	@Input("zoneId")
	public zoneId: number;

	@Input("zoneFrom")
	public zoneFrom: number;

	@Input("zoneTo")
	public zoneTo: number;

	@Input("prevZoneFrom")
	public prevZoneFrom: number;

	@Input("nextZoneTo")
	public nextZoneTo: number;

	@Input("isFirstZone")
	public isFirstZone: boolean;

	@Input("isLastZone")
	public isLastZone: boolean;

	@Input("currentZones")
	public currentZones: IZone[];

	@Input("zoneDefinition")
	public zoneDefinition: ZoneDefinition;

	constructor(private zonesService: ZonesService,
				private snackBar: MatSnackBar) {
	}

	public ngOnInit(): void {

		this.zonesService.zoneChangeOrderUpdates.subscribe((change: ZoneChangeOrder) => {

			const isChangeOrderForMe = (!_.isNull(change) && (this.zoneId === change.destinationId));

			if (isChangeOrderForMe) {
				this.applyChangeOrder(change);
			}

		}, error => {

			console.error(error);

		}, () => {

			console.log("InstructionListener complete");

		});

		this.zonesService.stepUpdates.subscribe((step: number) => {
			this.zoneDefinition.step = step;
		});
	}

	public onZoneChange(changeType: ZoneChangeType): void {
		this.whisperZoneChange(changeType);
	}

	/**
	 * Whisper a ZoneChangeWhisper to <ZoneService>
	 * @param {ZoneChangeType} changeType
	 */
	public whisperZoneChange(changeType: ZoneChangeType): void {

		if (changeType.from && changeType.to) { // Skip notify zone service on first component display
			return;
		}

		if (changeType.from || changeType.to) {

			const zoneChangeWhisper: ZoneChangeWhisper = {
				sourceId: this.zoneId,
				from: false,
				to: false,
				value: null
			};

			if (changeType.from) {
				zoneChangeWhisper.from = true;
				zoneChangeWhisper.value = this.zone.from;
			} else if (changeType.to) {
				zoneChangeWhisper.to = true;
				zoneChangeWhisper.value = this.zone.to;
			}

			this.zonesService.whisperZoneChange(zoneChangeWhisper);
		}
	}

	private applyChangeOrder(instruction: ZoneChangeOrder): void {

		if (instruction.from) {
			this.zone.from = instruction.value;
		}
		if (instruction.to) {
			this.zone.to = instruction.value;
		}
	}

	public onRemoveZoneAtIndex(zoneId: number): void {

		this.zonesService.removeZoneAtIndex(zoneId)
			.then(
				message => this.popSnack(message),
				error => this.popSnack(error)
			);
	}

	/**
	 * Avoid
	 * @param {KeyboardEvent} event
	 */
	public onKeyDown(event: KeyboardEvent): void {

		const whiteListCode = [
			38, // Up arrow
			40, // Down arrow
			9, // Tab
			16 // Shift
		];

		const isKeyWhiteListed = _.indexOf(whiteListCode, event.keyCode) === -1;

		if (isKeyWhiteListed) {
			event.preventDefault();
		}
	}

	private popSnack(message: string): void {
		this.snackBar.open(message, "Close", {duration: 2500});
	}
}