import { ComponentOptionsBase, ComponentOptionsMixin, ComponentOptionsWithArrayProps, ComponentOptionsWithObjectProps, ComponentOptionsWithoutProps, ComponentPropsOptions, ComputedOptions, EmitsOptions, MethodOptions } from "@vue/runtime-core";
import MulticastCallback from './multicast-callback';

interface CallbacksBase {
    [K: string]: MulticastCallback<any[]>;
}

type Method<Callback> = Callback extends MulticastCallback<infer P> ? (...args: P) => void : never;

type Methods<Callbacks extends CallbacksBase> = {
    [K in keyof Callbacks]: Method<Callbacks[K]>;
}

type OptionsBase = ComponentOptionsBase<any, any, any, any, any, any, any, any, any, any>;

interface UseMulticastCallbacks {
    <Callbacks extends CallbacksBase, Props = {}, RawBindings = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions & Methods<Callbacks> = Methods<Callbacks>, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = EmitsOptions, EE extends string = string>(callbacks: Callbacks, options: ComponentOptionsWithoutProps<Props, RawBindings, D, C, M, Mixin, Extends, E, EE>): ComponentOptionsWithoutProps<Props, RawBindings, D, C, M, Mixin, Extends, E, EE>;
    <Callbacks extends CallbacksBase, PropNames extends string, RawBindings, D, C extends ComputedOptions = {}, M extends MethodOptions & Methods<Callbacks> = Methods<Callbacks>, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = Record<string, any>, EE extends string = string>(callbacks: Callbacks, options: ComponentOptionsWithArrayProps<PropNames, RawBindings, D, C, M, Mixin, Extends, E, EE>): ComponentOptionsWithArrayProps<PropNames, RawBindings, D, C, M, Mixin, Extends, E, EE>;
    <Callbacks extends CallbacksBase, PropsOptions extends Readonly<ComponentPropsOptions>, RawBindings, D, C extends ComputedOptions = {}, M extends MethodOptions & Methods<Callbacks> = Methods<Callbacks>, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = Record<string, any>, EE extends string = string>(callbacks: Callbacks, options: ComponentOptionsWithObjectProps<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE>): ComponentOptionsWithObjectProps<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE>;
}

const useMulticastCallbacks = function useMulticastCallbacks<TCallbacks extends CallbacksBase>(callbacks: TCallbacks, options: OptionsBase): any {
    const entries: [keyof TCallbacks, TCallbacks[keyof TCallbacks]][] = Object.entries(callbacks) as any;

    const originalBeforeMount = options.beforeMount;
    const originalUnmounted = options.unmounted;

    return Object.assign(options, {
        beforeMount(): void {
            for (const [key, callback] of entries) {
                callback.add((this as any)[key]);
            }
            if (null != originalBeforeMount) {
                originalBeforeMount.call(this);
            }
        },
        unmounted(): void {
            if (null != originalUnmounted) {
                originalUnmounted.call(this);
            }
            for (const [key, callback] of entries) {
                callback.delete((this as any)[key]);
            }
        },
    });
} as UseMulticastCallbacks;


export { useMulticastCallbacks };