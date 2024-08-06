import {ref} from "vue";
import {SortableColumn} from "@/core/models/table.model";
import {FilterDropDownItem} from "@/core/models/common.model";

export const LegTableHeader = [
    {
        label: 'Name',
        fullLabel: '',
        field: 'name',
        class: ''
    },
    {
        label: 'Status',
        fullLabel: '',
        field: 'isActive',
        class: ''
    },
    {
        label: 'Last Scraped At',
        fullLabel: '',
        field: 'lastUpdated',
        class: ''
    },
    {
        label: 'Scrape until',
        fullLabel: '',
        field: 'scrapeDate',
        class: 'text-center'
    },
]

export const subLegTableHeader = [
    {
        label: 'Act',
        fullLabel: '',
        field: 'act_name',
    },
    {
        label: 'State',
        fullLabel: '',
        field: 'act_state',
    },
    {
        label: 'Subscribed Organization',
        fullLabel: '',
        field: 'count',
    },
    {
        label: 'Division',
        fullLabel: '',
        field: 'div',
    },
    {
        label: 'Description',
        fullLabel: '',
        field: 'desc',
    },
]



