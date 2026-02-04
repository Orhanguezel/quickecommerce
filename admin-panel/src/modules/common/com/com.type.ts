import { type QueryOptions } from "@/types";


export interface GeneralQueryOptions extends QueryOptions {
    filter?: any;
}

export interface CurrencyQueryOptions extends QueryOptions {

}


export interface KeywordSuggestionQueryOptions extends QueryOptions {
    query: string;
}
