export type CustomerProfile = {
  user_id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

export type CustomerProfilePatch = {
  full_name?: string
  phone?: string | null
}

export type ProfilePatchValidationResult =
  | { ok: true; patch: CustomerProfilePatch }
  | { ok: false; message: string }

const EMAIL_CHANGE_MESSAGE = 'Email cannot be changed via profile API.'
const VERIFICATION_NOT_IMPLEMENTED_MESSAGE =
  'Phone verification is not implemented in Release v1. Extension point reserved for future verification flow.'

export function validateCustomerProfilePatch(body: unknown): ProfilePatchValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Invalid request body.' }
  }

  const record = body as Record<string, unknown>

  if ('email' in record) {
    return { ok: false, message: EMAIL_CHANGE_MESSAGE }
  }

  if ('verification_code' in record || 'phone_verification_code' in record) {
    return { ok: false, message: VERIFICATION_NOT_IMPLEMENTED_MESSAGE }
  }

  const patch: CustomerProfilePatch = {}

  if ('full_name' in record) {
    if (typeof record.full_name !== 'string') {
      return { ok: false, message: 'full_name must be a string.' }
    }
    const fullName = record.full_name.trim()
    if (!fullName) {
      return { ok: false, message: 'full_name cannot be empty.' }
    }
    if (fullName.length > 200) {
      return { ok: false, message: 'full_name is too long.' }
    }
    patch.full_name = fullName
  }

  if ('phone' in record) {
    if (record.phone === null) {
      patch.phone = null
    } else if (typeof record.phone === 'string') {
      const phone = record.phone.trim()
      if (phone.length > 32) {
        return { ok: false, message: 'phone is too long.' }
      }
      patch.phone = phone || null
    } else {
      return { ok: false, message: 'phone must be a string or null.' }
    }
  }

  if (!('full_name' in patch) && !('phone' in patch)) {
    return { ok: false, message: 'No editable profile fields provided.' }
  }

  return { ok: true, patch }
}

export function mapProfileRow(row: {
  user_id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}): CustomerProfile {
  return {
    user_id: row.user_id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}
