export type AnalyticsEventName =
  | 'landing_cta_click'
  | 'category_selected'
  | 'constructor_started'
  | 'dimension_changed'
  | 'preset_selected'
  | 'filling_changed'
  | 'material_selected'
  | 'opening_selected'
  | 'hardware_selected'
  | 'facade_mode_selected'
  | 'project_share_created'
  | 'basis_export_downloaded'
  | 'price_changed'
  | 'validation_error_shown'
  | 'checkout_opened'
  | 'checkout_submitted'
  | 'checkout_submit_failed'
  | 'project_loaded_by_id'
  | 'project_loaded_from_local_library'
  | 'mobile_preview_opened'
  | 'consultation_clicked'

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export function trackEvent(event: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') return

  window.dataLayer?.push({
    event,
    ...payload,
  })
}
