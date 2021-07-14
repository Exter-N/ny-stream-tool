import { ComponentOptionsBase, ComponentOptionsMixin, ComponentOptionsWithArrayProps, ComponentOptionsWithObjectProps, ComponentOptionsWithoutProps, ComponentPropsOptions, ComputedOptions, EmitsOptions, MethodOptions } from "@vue/runtime-core";
import { getBlankSettings, Settings } from "../../../common/settings";
import { settingsAddOnChange, settingsRemoveOnChange } from "./settings";

interface SettingsBase {
    [K: string]: keyof Settings;
}

type OptionsBase = ComponentOptionsBase<any, any, any, any, any, any, any, any, any, any>;

type SettingsData<TSettings extends SettingsBase> = {
    [K in keyof TSettings]: Settings[TSettings[K]];
};

type OmitFromReturn<F, K extends string | number | symbol> = F extends (...args: any) => any ? (this: ThisParameterType<F>, ...args: Parameters<F>) => Omit<ReturnType<F>, K> : F;

type OmitSettings<Settings extends SettingsBase, ComponentOptions extends { data?: (...args: any) => any; }> = ComponentOptions | (Omit<ComponentOptions, 'data'> & {
    data?: OmitFromReturn<ComponentOptions['data'], keyof Settings>;
});

interface UseSettings {
    <Settings extends SettingsBase, Props = {}, RawBindings = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = EmitsOptions, EE extends string = string>(settings: Settings, options: OmitSettings<Settings, ComponentOptionsWithoutProps<Props, RawBindings, D & SettingsData<Settings>, C, M, Mixin, Extends, E, EE>>): ComponentOptionsWithoutProps<Props, RawBindings, D & SettingsData<Settings>, C, M, Mixin, Extends, E, EE>;
    <Settings extends SettingsBase, PropNames extends string, RawBindings, D, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = Record<string, any>, EE extends string = string>(settings: Settings, options: OmitSettings<Settings, ComponentOptionsWithArrayProps<PropNames, RawBindings, D & SettingsData<Settings>, C, M, Mixin, Extends, E, EE>>): ComponentOptionsWithArrayProps<PropNames, RawBindings, D & SettingsData<Settings>, C, M, Mixin, Extends, E, EE>;
    <Settings extends SettingsBase, PropsOptions extends Readonly<ComponentPropsOptions>, RawBindings, D, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = Record<string, any>, EE extends string = string>(settings: Settings, options: OmitSettings<Settings, ComponentOptionsWithObjectProps<PropsOptions, RawBindings, D & SettingsData<Settings>, C, M, Mixin, Extends, E, EE>>): ComponentOptionsWithObjectProps<PropsOptions, RawBindings, D & SettingsData<Settings>, C, M, Mixin, Extends, E, EE>;
}

const useSettings = function useSettings<TSettings extends SettingsBase>(settings: TSettings, options: OptionsBase): any {
    const entries: [keyof TSettings, TSettings[keyof TSettings]][] = Object.entries(settings) as any;
    if (0 === entries.length) {
        return options;
    }

    const originalData = options.data;
    const originalBeforeMount = options.beforeMount;
    const originalUnmounted = options.unmounted;
    const methods = options.methods ?? { };

    const setterKeys: { [K in keyof TSettings]: string; } = { } as any;
    for (const [key] of entries) {
        setterKeys[key] = 'set <useSettings> ' + String(key);
        methods[setterKeys[key]] = function (value: any): void {
            (this as any)[key] = value;
        };
    }

    return Object.assign(options, {
        data(vm: any): any {
            const blank = getBlankSettings();

            const data = (null != originalData) ? originalData.call(this, vm) : { };
            for (const [key, setting] of entries) {
                data[key] = blank[setting];
            }

            return data;
        },
        beforeMount(): void {
            for (const [key, setting] of entries) {
                settingsAddOnChange(setting, (this as any)[setterKeys[key]], true);
            }
            if (null != originalBeforeMount) {
                originalBeforeMount.call(this);
            }
        },
        unmounted(): void {
            if (null != originalUnmounted) {
                originalUnmounted.call(this);
            }
            for (const [key, setting] of entries) {
                settingsRemoveOnChange(setting, (this as any)[setterKeys[key]]);
            }
        },
        methods,
    });
} as UseSettings;

export { useSettings };