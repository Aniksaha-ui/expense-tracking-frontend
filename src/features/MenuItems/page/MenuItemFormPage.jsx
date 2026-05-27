import { ArrowLeft, LayoutPanelLeft, Save, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../../../components/common/Toaster'
import { APP_ROUTES } from '../../../constants/routes'
import { useAuthContext } from '../../../contexts/AuthContext'
import {
  MENU_ITEM_FORM_DEFAULT_VALUES,
  MENU_ITEM_LOCATION_SUGGESTIONS,
  MENU_ITEM_ROLE_OPTIONS,
} from '../constants/menuItems.constants'
import {
  createMenuItem,
  getMenuItemById,
  updateMenuItem,
} from '../service/menuItemsService'
import {
  buildMenuItemPayload,
  formatMenuItemRoleLabel,
  getMenuItemLocationToneClassName,
  getMenuItemRoleToneClassName,
} from '../utils/menuItemsUtils'

function SectionCard({ children, description, title }) {
  return (
    <section className="rounded-[24px] border border-[#2d282b] bg-[#171314] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <header className="border-b border-[#2d282b] px-4 py-4 sm:px-5">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm text-[#8fa0bd]">{description}</p>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}

export default function MenuItemFormPage({ action = 'add' }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { loadMenu } = useAuthContext()
  const { id } = useParams()
  const isEditing = action === 'update'
  const [formData, setFormData] = useState(MENU_ITEM_FORM_DEFAULT_VALUES)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isEditing || !id) {
      return undefined
    }

    let mounted = true

    const loadRecord = async () => {
      setIsLoading(true)

      try {
        const menuItem = await getMenuItemById(id)

        if (!mounted) {
          return
        }

        setFormData(menuItem)
      } catch (error) {
        if (!mounted) {
          return
        }

        toast.error(error.message || 'Unable to load menu item details.')
        navigate(APP_ROUTES.menuItems)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void loadRecord()

    return () => {
      mounted = false
    }
  }, [id, isEditing, navigate, toast])

  const activeRoles = useMemo(() => new Set(formData.roles), [formData.roles])

  const updateField = (name, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const toggleRole = (role) => {
    setFormData((currentData) => {
      const nextRoles = currentData.roles.includes(role)
        ? currentData.roles.filter((currentRole) => currentRole !== role)
        : [...currentData.roles, role]

      return {
        ...currentData,
        roles: nextRoles,
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Menu title is required.')
      return
    }

    if (!formData.path.trim()) {
      toast.error('Menu path is required.')
      return
    }

    if (!formData.icon.trim()) {
      toast.error('Menu icon is required.')
      return
    }

    if (!formData.location.trim()) {
      toast.error('Menu location is required.')
      return
    }

    if (!formData.roles.length) {
      toast.error('Select at least one role.')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = buildMenuItemPayload(formData)

      if (isEditing && id) {
        await updateMenuItem(id, payload)
        toast.success('Menu item updated successfully.')
      } else {
        await createMenuItem(payload)
        toast.success('Menu item created successfully.')
      }

      await loadMenu({ force: true }).catch(() => {})
      navigate(APP_ROUTES.menuItems)
    } catch (error) {
      toast.error(error.message || `Unable to ${isEditing ? 'update' : 'create'} menu item.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="routes-page">
        <div className="routes-page__inner">
          <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-[#2d282b] bg-[#171314] text-sm font-semibold text-[#8fa0bd]">
            Loading menu item form...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner space-y-5">
        <header className="rounded-[28px] border border-[#2d282b] bg-[#171314] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#332d30] bg-[#211d20] text-[#c5d9f7]"
                onClick={() => navigate(APP_ROUTES.menuItems)}
              >
                <ArrowLeft size={16} />
              </button>

              <div>
                <div className="routes-page__title">
                  <LayoutPanelLeft size={20} color="#4f83ff" />
                  <h1>{isEditing ? 'Update Menu Item' : 'Create Menu Item'}</h1>
                </div>
                <p className="routes-page__subtitle">
                  Define the route, icon, placement, and role visibility for this navigation entry.
                </p>
              </div>
            </div>

            <div
              className={`inline-flex h-10 w-full items-center justify-center rounded-lg border px-4 text-sm font-semibold sm:w-auto ${getMenuItemLocationToneClassName(
                formData.location,
              )}`}
            >
              {formData.location || MENU_ITEM_FORM_DEFAULT_VALUES.location}
            </div>
          </div>
        </header>

        <form className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_360px]" onSubmit={handleSubmit}>
          <SectionCard
            title="Navigation Details"
            description="Set the label, route, visual icon key, and placement used by the menu system."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="crud-field md:col-span-2">
                <span>Title</span>
                <input
                  name="title"
                  placeholder="Settings"
                  value={formData.title}
                  onChange={(event) => updateField('title', event.target.value)}
                />
              </label>

              <label className="crud-field md:col-span-2">
                <span>Path</span>
                <input
                  name="path"
                  placeholder="/admin/settings"
                  value={formData.path}
                  onChange={(event) => updateField('path', event.target.value)}
                />
              </label>

              <label className="crud-field">
                <span>Icon</span>
                <input
                  name="icon"
                  placeholder="SettingsIcon"
                  value={formData.icon}
                  onChange={(event) => updateField('icon', event.target.value)}
                />
              </label>

              <label className="crud-field">
                <span>Order</span>
                <input
                  min="0"
                  name="order"
                  placeholder="0"
                  type="number"
                  value={formData.order}
                  onChange={(event) => updateField('order', event.target.value)}
                />
              </label>

              <label className="crud-field md:col-span-2">
                <span>Location</span>
                <input
                  list="menu-item-location-options"
                  name="location"
                  placeholder="sidebar"
                  value={formData.location}
                  onChange={(event) => updateField('location', event.target.value)}
                />
                <datalist id="menu-item-location-options">
                  {MENU_ITEM_LOCATION_SUGGESTIONS.map((location) => (
                    <option key={location} value={location} />
                  ))}
                </datalist>
                <small>Use the legacy placement key the backend expects, such as `sidebar`.</small>
              </label>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck size={16} className="text-[#7ea1ff]" />
                <span>Roles</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {MENU_ITEM_ROLE_OPTIONS.map((roleOption) => {
                  const isActive = activeRoles.has(roleOption.value)

                  return (
                    <button
                      key={roleOption.value}
                      type="button"
                      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition sm:w-auto sm:justify-start ${
                        isActive
                          ? getMenuItemRoleToneClassName(roleOption.value)
                          : 'border-[#332d30] bg-[#211d20] text-[#c5d9f7] hover:bg-white/5'
                      }`}
                      onClick={() => toggleRole(roleOption.value)}
                    >
                      {formatMenuItemRoleLabel(roleOption.value)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#332d30] bg-[#211d20] px-5 text-sm font-semibold text-[#c5d9f7] transition hover:bg-white/5 sm:w-auto"
                onClick={() => navigate(APP_ROUTES.menuItems)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-[linear-gradient(135deg,rgba(37,99,235,0.24),rgba(8,47,73,0.4))] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-75 sm:w-auto"
                disabled={isSubmitting}
              >
                <Save size={16} />
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Menu Item' : 'Create Menu Item'}
              </button>
            </div>
          </SectionCard>

          <div className="space-y-5">
            <SectionCard
              title="Live Preview"
              description="Check how this record will read before you save it to the admin navigation."
            >
              <div className="space-y-3">
                <div className="rounded-[18px] border border-[#332d30] bg-[#211d20] px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7ea1ff]">
                    Menu Title
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {formData.title || 'Untitled menu item'}
                  </p>
                </div>

                <div className="rounded-[18px] border border-[#332d30] bg-[#211d20] px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7ea1ff]">
                    Route
                  </p>
                  <code className="mt-2 block text-sm text-[#dbe7fb]">
                    {formData.path || '/admin/example-route'}
                  </code>
                </div>

                <div className="rounded-[18px] border border-[#332d30] bg-[#211d20] px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7ea1ff]">
                    Visibility
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.roles.length ? (
                      formData.roles.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getMenuItemRoleToneClassName(
                            role,
                          )}`}
                        >
                          {formatMenuItemRoleLabel(role)}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#8fa0bd]">No roles selected yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Ops Note"
              description="These settings update the same menu records used by the sidebar, so changes affect navigation after refresh."
            >
              <div className="rounded-[18px] border border-[#332d30] bg-[#211d20] px-4 py-4 text-sm leading-6 text-[#8fa0bd]">
                Keep the path and icon keys aligned with the rest of the admin routes. If an item
                should appear for both admin and guide, enable both roles before saving.
              </div>
            </SectionCard>
          </div>
        </form>
      </div>
    </main>
  )
}
