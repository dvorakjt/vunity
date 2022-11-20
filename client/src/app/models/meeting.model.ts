export class Meeting {
    constructor(
        public id:string, 
        public title:string, 
        public password:string, 
        public duration:number, 
        public dateTime:string, 
        public guests:string[],
        public ownerId:string) {}
}