import { Injectable } from "@angular/core";
import { SelectedDate } from "src/app/types/selected-date.type";

@Injectable({providedIn: 'root'})
export class ViewDateService {
    selectedDate?:SelectedDate;
}