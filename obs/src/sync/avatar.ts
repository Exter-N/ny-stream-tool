import { settingsAddOnChange } from "./settings";

settingsAddOnChange('avatar', (value: boolean) => {
    document.body.classList?.toggle('with-avatar', value);
});