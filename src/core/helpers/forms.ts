import {ref} from "vue";
import {required} from "@vuelidate/validators";

export const getTabClasses = (id :number, tabIndex :number) => {
    const tabClass = ''
    if (id === tabIndex) return 'active'
    if (id < tabIndex) return 'previous'
    return tabClass
}
