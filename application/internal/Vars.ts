const key = (value: string) => `__caffeine:${value}`

export const Vars = {
  APP_NAMESPACE: key('app_namespace'),
  APP_SCAN: key('app_scan'),
  APP_BOOTSTRAP_COMPONENT: key('app_bootstrap_component'),
  APP_PROFILE: key('app_profile'),
}
