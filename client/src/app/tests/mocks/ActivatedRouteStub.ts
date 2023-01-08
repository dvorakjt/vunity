export class ActivatedRouteStub {
    snapshot = {
        queryParamMap : {
            get(queryParam:string) {
                return null;
            }
        },
        paramMap : {
            get(param:string) {
                return null;
            }
        }
    }
}