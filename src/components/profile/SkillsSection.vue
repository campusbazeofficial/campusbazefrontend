<!-- src/components/profile/SkillsSection.vue -->
<template>
  <div class="rounded-2xl bg-[var(--color-cb-card)] border border-[var(--color-cb-divider)] p-5 flex flex-col gap-4">

    <!-- ── Header ── -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="flex items-center gap-2 text-sm font-bold text-[var(--color-cb-text)]">
        <i class="fa-solid fa-code text-[var(--color-cb-accent)]"></i>
        Skills & Expertise
        <span
          v-if="skills.length"
          class="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-cb-accent-subtle)] text-[var(--color-cb-accent)] text-[0.6rem] font-bold"
        >{{ skills.length }}</span>
      </h2>
      <button
        @click="openAddModal"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-cb-accent)] text-white text-xs font-semibold hover:opacity-88 transition-opacity"
      >
        <i class="fa-solid fa-plus"></i>
        Add Skill
      </button>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="flex items-center justify-center py-10">
      <div class="flex flex-col items-center gap-3">
        <div class="w-7 h-7 rounded-full border-2 border-[var(--color-cb-divider)] border-t-[var(--color-cb-accent)] animate-spin"></div>
        <p class="text-xs text-[var(--color-cb-muted)]">Loading skills…</p>
      </div>
    </div>

    <!-- ── Empty state ── -->
    <div
      v-else-if="skills.length === 0"
      class="flex flex-col items-center gap-3 py-10 text-center"
    >
      <div class="w-14 h-14 rounded-2xl bg-[var(--color-cb-field)] flex items-center justify-center">
        <i class="fa-solid fa-brain text-2xl text-[var(--color-cb-divider)]"></i>
      </div>
      <div>
        <p class="text-sm font-semibold text-[var(--color-cb-text)]">No skills added yet</p>
        <p class="text-xs text-[var(--color-cb-muted)] mt-0.5">Showcase your expertise to potential clients.</p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-[var(--color-cb-divider)] text-xs font-semibold text-[var(--color-cb-muted)] hover:border-[var(--color-cb-accent)] hover:text-[var(--color-cb-accent)] transition-colors"
      >
        <i class="fa-solid fa-plus"></i> Add your first skill
      </button>
    </div>

    <!-- ── Skills grid ── -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <div
        v-for="skill in skills"
        :key="skill._id"
        class="group relative p-3.5 rounded-xl bg-[var(--color-cb-base)] border border-[var(--color-cb-divider)] hover:border-[var(--color-cb-accent)]/50 hover:shadow-sm transition-all"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <!-- Name + badge -->
            <div class="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 class="text-sm font-semibold text-[var(--color-cb-text)] truncate">{{ skill.name }}</h3>
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold"
                :class="getProficiencyClass(skill.proficiency)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                {{ getProficiencyLabel(skill.proficiency) }}
              </span>
            </div>

            <!-- Meta row -->
            <div class="flex flex-wrap gap-x-3 gap-y-0.5">
              <span v-if="skill.category" class="text-[0.72rem] text-[var(--color-cb-muted)] flex items-center gap-1">
                <i class="fa-solid fa-tag text-[0.6rem]"></i>{{ skill.category }}
              </span>
              <span v-if="skill.yearsOfExperience" class="text-[0.72rem] text-[var(--color-cb-muted)] flex items-center gap-1">
                <i class="fa-regular fa-calendar text-[0.6rem]"></i>{{ skill.yearsOfExperience }}yr{{ skill.yearsOfExperience !== 1 ? 's' : '' }}
              </span>
            </div>

            <p v-if="skill.description" class="text-[0.72rem] text-[var(--color-cb-muted)] mt-1.5 line-clamp-2 leading-relaxed">
              {{ skill.description }}
            </p>
          </div>

          <!-- Action buttons (visible on hover) -->
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              @click="openEditModal(skill)"
              class="w-7 h-7 rounded-lg bg-[var(--color-cb-field)] flex items-center justify-center text-[var(--color-cb-muted)] hover:bg-[var(--color-cb-accent-subtle)] hover:text-[var(--color-cb-accent)] transition-colors"
              title="Edit skill"
            >
              <i class="fa-solid fa-pen text-[0.65rem]"></i>
            </button>
            <button
              @click="openDeleteModal(skill)"
              class="w-7 h-7 rounded-lg bg-[var(--color-cb-field)] flex items-center justify-center text-[var(--color-cb-muted)] hover:bg-[var(--color-cb-negative-subtle)] hover:text-[var(--color-cb-negative)] transition-colors"
              title="Delete skill"
            >
              <i class="fa-solid fa-trash text-[0.65rem]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════
         ADD / EDIT MODAL
    ════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modalVisible"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          @mousedown.self="closeModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

          <!-- Panel -->
          <div class="skill-modal relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-[var(--color-cb-card)] shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85dvh]">

            <!-- Drag handle (mobile) -->
            <div class="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
              <div class="w-10 h-1 rounded-full bg-[var(--color-cb-divider)]"></div>
            </div>

            <!-- Modal header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--color-cb-divider)] flex-shrink-0">
              <div>
                <h3 class="text-base font-bold text-[var(--color-cb-text)]">
                  {{ isEditing ? 'Edit Skill' : 'Add New Skill' }}
                </h3>
                <p class="text-xs text-[var(--color-cb-muted)] mt-0.5">
                  {{ isEditing ? 'Update your skill information.' : 'Tell clients what you\'re good at.' }}
                </p>
              </div>
              <button
                @click="closeModal"
                class="w-8 h-8 rounded-full bg-[var(--color-cb-field)] flex items-center justify-center text-[var(--color-cb-muted)] hover:text-[var(--color-cb-text)] transition-colors flex-shrink-0"
              >
                <i class="fa-solid fa-times text-sm"></i>
              </button>
            </div>

            <!-- Modal body (scrollable) -->
            <div class="overflow-y-auto flex-1 px-5 py-5">
              <div class="flex flex-col gap-4">

                <!-- Skill Name -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--color-cb-text)]">
                    Skill Name <span class="text-[var(--color-cb-negative)]">*</span>
                  </label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="form-input"
                    :class="{ 'border-[var(--color-cb-negative)]': formErrors.name }"
                    placeholder="e.g., Plumbing, Web Development, Graphic Design"
                    @input="formErrors.name = ''"
                  />
                  <p v-if="formErrors.name" class="text-[0.7rem] text-[var(--color-cb-negative)]">
                    {{ formErrors.name }}
                  </p>
                </div>

                <!-- Proficiency — custom dropdown -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--color-cb-text)]">
                    Proficiency Level <span class="text-[var(--color-cb-negative)]">*</span>
                  </label>
                  <div class="relative" ref="proficiencyDropdownRef">
                    <!-- Trigger -->
                    <button
                      type="button"
                      class="form-input flex items-center justify-between cursor-pointer text-left"
                      :class="{ 'border-[var(--color-cb-negative)]': formErrors.proficiency }"
                      @click="proficiencyOpen = !proficiencyOpen"
                    >
                      <span v-if="formData.proficiency" class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold"
                          :class="getProficiencyClass(formData.proficiency)"
                        >
                          <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                          {{ getProficiencyLabel(formData.proficiency) }}
                        </span>
                        <span class="text-sm text-[var(--color-cb-text)]">
                          {{ proficiencyMeta[formData.proficiency]?.desc }}
                        </span>
                      </span>
                      <span v-else class="text-[var(--color-cb-muted)]">Select proficiency level</span>
                      <i
                        class="fa-solid fa-chevron-down text-[var(--color-cb-muted)] text-xs transition-transform flex-shrink-0"
                        :class="{ 'rotate-180': proficiencyOpen }"
                      ></i>
                    </button>

                    <!-- Dropdown options -->
                    <Transition name="dropdown">
                      <div
                        v-if="proficiencyOpen"
                        class="absolute z-20 left-0 right-0 mt-1.5 rounded-xl border border-[var(--color-cb-divider)] bg-[var(--color-cb-card)] shadow-xl overflow-hidden"
                      >
                        <button
                          v-for="opt in proficiencyOptions"
                          :key="opt.value"
                          type="button"
                          class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-cb-field)] transition-colors"
                          :class="{ 'bg-[var(--color-cb-field)]': formData.proficiency === opt.value }"
                          @click="selectProficiency(opt.value)"
                        >
                          <span
                            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6rem] font-bold flex-shrink-0"
                            :class="opt.class"
                          >
                            <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                            {{ opt.label }}
                          </span>
                          <span class="flex-1 min-w-0">
                            <span class="block text-xs font-semibold text-[var(--color-cb-text)]">{{ opt.label }}</span>
                            <span class="block text-[0.7rem] text-[var(--color-cb-muted)]">{{ opt.desc }}</span>
                          </span>
                          <i
                            v-if="formData.proficiency === opt.value"
                            class="fa-solid fa-check text-[var(--color-cb-accent)] text-xs flex-shrink-0"
                          ></i>
                        </button>
                      </div>
                    </Transition>
                  </div>
                  <p v-if="formErrors.proficiency" class="text-[0.7rem] text-[var(--color-cb-negative)]">
                    {{ formErrors.proficiency }}
                  </p>
                </div>

                <!-- Category -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--color-cb-text)]">Category</label>
                  <input
                    v-model="formData.category"
                    type="text"
                    class="form-input"
                    placeholder="e.g., Home Services, Technology, Design"
                  />
                </div>

                <!-- Years of Experience -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--color-cb-text)]">Years of Experience</label>
                  <div class="relative">
                    <input
                      v-model="formData.yearsOfExperience"
                      type="text"
                      inputmode="decimal"
                      class="form-input pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      :class="{ 'border-[var(--color-cb-negative)]': formErrors.yearsOfExperience }"
                      placeholder="0"
                      @input="onYearsInput"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-cb-muted)] pointer-events-none">years</span>
                  </div>
                  <p v-if="formErrors.yearsOfExperience" class="text-[0.7rem] text-[var(--color-cb-negative)]">
                    {{ formErrors.yearsOfExperience }}
                  </p>
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-semibold text-[var(--color-cb-text)]">Description</label>
                    <span
                      class="text-[0.7rem]"
                      :class="(formData.description || '').length > 480 ? 'text-[var(--color-cb-warning)]' : 'text-[var(--color-cb-muted)]'"
                    >{{ (formData.description || '').length }}/500</span>
                  </div>
                  <textarea
                    v-model="formData.description"
                    class="form-input resize-none"
                    :class="{ 'border-[var(--color-cb-negative)]': formErrors.description }"
                    placeholder="Describe your experience with this skill…"
                    rows="3"
                    maxlength="500"
                    @input="formErrors.description = ''"
                  ></textarea>
                  <p v-if="formErrors.description" class="text-[0.7rem] text-[var(--color-cb-negative)]">
                    {{ formErrors.description }}
                  </p>
                </div>

                <!-- Error banner -->
                <div
                  v-if="modalError"
                  class="flex items-start gap-2.5 text-xs text-[var(--color-cb-negative)] bg-[var(--color-cb-negative-subtle)] rounded-xl px-4 py-3"
                >
                  <i class="fa-solid fa-circle-exclamation mt-0.5 flex-shrink-0"></i>
                  <span>{{ modalError }}</span>
                </div>
              </div>
            </div>

            <!-- Modal footer -->
            <div class="flex items-center gap-3 px-5 py-4 border-t border-[var(--color-cb-divider)] flex-shrink-0">
              <button type="button" class="btn-cancel flex-1 sm:flex-none" @click="closeModal">Cancel</button>
              <button
                type="button"
                class="btn-save flex-1 sm:flex-none justify-center"
                :disabled="submitting"
                @click="handleSubmit"
              >
                <span v-if="submitting" class="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                <span>{{ isEditing ? 'Save Changes' : 'Add Skill' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ════════════════════════════════════════
         DELETE CONFIRMATION MODAL
    ════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="deleteModal.show"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @mousedown.self="deleteModal.show = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="deleteModal.show = false"></div>

          <div class="relative w-full max-w-sm rounded-2xl bg-[var(--color-cb-card)] shadow-2xl overflow-hidden">
            <!-- Red top accent -->
            <div class="h-1 w-full bg-[var(--color-cb-negative)]"></div>

            <div class="p-6 flex flex-col gap-4">
              <!-- Icon -->
              <div class="w-12 h-12 rounded-2xl bg-[var(--color-cb-negative-subtle)] flex items-center justify-center">
                <i class="fa-solid fa-trash text-[var(--color-cb-negative)] text-lg"></i>
              </div>

              <div>
                <h3 class="text-base font-bold text-[var(--color-cb-text)]">Delete skill?</h3>
                <p class="text-sm text-[var(--color-cb-muted)] mt-1">
                  <strong class="text-[var(--color-cb-text)]">"{{ deleteModal.skillName }}"</strong>
                  will be permanently removed from your profile. This cannot be undone.
                </p>
              </div>

              <!-- Error -->
              <div
                v-if="deleteError"
                class="flex items-start gap-2 text-xs text-[var(--color-cb-negative)] bg-[var(--color-cb-negative-subtle)] rounded-lg px-3 py-2.5"
              >
                <i class="fa-solid fa-circle-exclamation mt-0.5 flex-shrink-0"></i>
                <span>{{ deleteError }}</span>
              </div>

              <div class="flex gap-3">
                <button
                  type="button"
                  class="btn-cancel flex-1"
                  :disabled="deleting"
                  @click="deleteModal.show = false"
                >Cancel</button>
                <button
                  type="button"
                  class="btn-delete flex-1"
                  :disabled="deleting"
                  @click="confirmDelete"
                >
                  <span v-if="deleting" class="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                  <span>{{ deleting ? 'Deleting…' : 'Yes, Delete' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useSkill } from '@/composables/useSkill'

// ── Props ──────────────────────────────────────────────────────────────────
const props = defineProps({
  userId: { type: String, default: null }
})

// ── Composable ─────────────────────────────────────────────────────────────
const {
  skills,
  loading,
  error: skillError,
  fetchMySkills,
  fetchSkillsByUserId,
  createSkill,
  updateSkill,
  deleteSkill: deleteSkillAction,
  clearError,
} = useSkill()

// ── Proficiency config ─────────────────────────────────────────────────────
const proficiencyOptions = [
  {
    value: 'beginner',
    label: 'Beginner',
    desc: 'Just getting started',
    class: 'bg-[var(--color-cb-info-subtle)] text-[var(--color-cb-info)]',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    desc: 'Comfortable with the basics',
    class: 'bg-[var(--color-cb-warning-subtle)] text-[var(--color-cb-warning)]',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    desc: 'Strong hands-on experience',
    class: 'bg-[var(--color-cb-success-subtle)] text-[var(--color-cb-success)]',
  },
  {
    value: 'expert',
    label: 'Expert',
    desc: 'Deep mastery & authority',
    class: 'bg-[var(--color-cb-primary-subtle)] text-[var(--color-cb-primary)]',
  },
]

const proficiencyMeta = Object.fromEntries(proficiencyOptions.map((o) => [o.value, o]))

const getProficiencyLabel = (level) => proficiencyMeta[level]?.label || level || 'Unknown'
const getProficiencyClass = (level) =>
  proficiencyMeta[level]?.class || 'bg-[var(--color-cb-field)] text-[var(--color-cb-muted)]'

// ── Add / Edit modal state ─────────────────────────────────────────────────
const modalVisible = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const modalError = ref('')
const proficiencyOpen = ref(false)
const proficiencyDropdownRef = ref(null)

const formData = reactive({
  name: '',
  proficiency: '',
  category: '',
  yearsOfExperience: null,
  description: '',
})

const formErrors = reactive({
  name: '',
  proficiency: '',
  yearsOfExperience: '',
  description: '',
})

// ── Delete modal state ─────────────────────────────────────────────────────
const deleteModal = ref({ show: false, skillId: null, skillName: '' })
const deleting = ref(false)
const deleteError = ref('')

// ── Close dropdown on outside click ───────────────────────────────────────
function handleOutsideClick(e) {
  if (proficiencyDropdownRef.value && !proficiencyDropdownRef.value.contains(e.target)) {
    proficiencyOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

// ── Data loading ───────────────────────────────────────────────────────────
const loadSkills = async () => {
  if (props.userId) {
    const res = await fetchSkillsByUserId(props.userId)
    // fetchSkillsByUserId returns data without mutating the store's skills ref,
    // so for view-only mode you'd manage local state — for this component
    // we assume it's always the current user's own skills tab.
  } else {
    await fetchMySkills()
  }
}

// ── Form helpers ───────────────────────────────────────────────────────────
const resetForm = () => {
  formData.name = ''
  formData.proficiency = ''
  formData.category = ''
  formData.yearsOfExperience = null
  formData.description = ''
  formErrors.name = ''
  formErrors.proficiency = ''
  formErrors.yearsOfExperience = ''
  formErrors.description = ''
  editingId.value = null
  isEditing.value = false
  modalError.value = ''
  proficiencyOpen.value = false
}

const validateForm = () => {
  let valid = true
  if (!formData.name?.trim()) {
    formErrors.name = 'Skill name is required'
    valid = false
  } else if (formData.name.length > 100) {
    formErrors.name = 'Must be under 100 characters'
    valid = false
  }
  if (!formData.proficiency) {
    formErrors.proficiency = 'Please select a proficiency level'
    valid = false
  }
  if (
    formData.yearsOfExperience !== null &&
    formData.yearsOfExperience !== '' &&
    (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 50)
  ) {
    formErrors.yearsOfExperience = 'Must be between 0 and 50'
    valid = false
  }
  if (formData.description && formData.description.length > 500) {
    formErrors.description = 'Must be under 500 characters'
    valid = false
  }
  return valid
}

// ── Modal open / close ─────────────────────────────────────────────────────
const openAddModal = () => {
  resetForm()
  modalVisible.value = true
}

const openEditModal = (skill) => {
  // Reset errors and close dropdown first
  Object.keys(formErrors).forEach((k) => (formErrors[k] = ''))
  modalError.value = ''
  proficiencyOpen.value = false

  // Populate every field explicitly — guard against undefined from API
  formData.name = skill.name || ''
  formData.proficiency = skill.proficiency || ''
  formData.category = skill.category != null ? String(skill.category) : ''
  formData.yearsOfExperience = skill.yearsOfExperience != null ? Number(skill.yearsOfExperience) : null
  formData.description = skill.description != null ? String(skill.description) : ''

  editingId.value = skill._id
  isEditing.value = true
  modalVisible.value = true
}

const closeModal = () => {
  if (submitting.value) return
  modalVisible.value = false
  resetForm()
}

// ── Proficiency dropdown ───────────────────────────────────────────────────
const selectProficiency = (value) => {
  formData.proficiency = value
  formErrors.proficiency = ''
  proficiencyOpen.value = false
}

// ── Years of experience — keep numeric, strip non-numeric chars ───────────
const onYearsInput = (e) => {
  formErrors.yearsOfExperience = ''
  const raw = e.target.value.replace(/[^0-9.]/g, '')
  // Allow only one decimal point
  const parts = raw.split('.')
  const clean = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw
  e.target.value = clean
  formData.yearsOfExperience = clean === '' ? null : Number(clean)
}

// ── Submit ─────────────────────────────────────────────────────────────────
const handleSubmit = async () => {
  modalError.value = ''
  if (!validateForm()) return

  submitting.value = true
  try {
    const payload = {
      name: formData.name.trim(),
      proficiency: formData.proficiency,
      ...(formData.category && { category: formData.category.trim() }),
      ...(formData.yearsOfExperience !== null && formData.yearsOfExperience !== ''
        ? { yearsOfExperience: Number(formData.yearsOfExperience) }
        : {}),
      ...(formData.description && { description: formData.description.trim() }),
    }

    const result = isEditing.value
      ? await updateSkill(editingId.value, payload)
      : await createSkill(payload)

    if (result.success) {
      submitting.value = false
      closeModal()
    } else {
      modalError.value = result.error || 'Failed to save skill. Please try again.'
    }
  } catch (err) {
    modalError.value = err.message || 'An unexpected error occurred.'
  } finally {
    submitting.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────
const openDeleteModal = (skill) => {
  deleteModal.value = { show: true, skillId: skill._id, skillName: skill.name }
  deleteError.value = ''
}

const confirmDelete = async () => {
  deleting.value = true
  deleteError.value = ''
  try {
    const result = await deleteSkillAction(deleteModal.value.skillId)
    if (result.success) {
      deleteModal.value.show = false
    } else {
      deleteError.value = result.error || 'Failed to delete skill.'
    }
  } catch (err) {
    deleteError.value = err.message || 'An unexpected error occurred.'
  } finally {
    deleting.value = false
  }
}

// ── Watch store errors ─────────────────────────────────────────────────────
watch(skillError, (err) => {
  if (err) {
    modalError.value = err
    clearError()
  }
})

onMounted(loadSkills)
</script>

<style scoped>
.form-input {
  width: 100%;
  background: var(--color-cb-base);
  border: 1.5px solid var(--color-cb-divider);
  border-radius: 10px;
  padding: 0.6rem 0.875rem;
  font-size: 0.875rem;
  color: var(--color-cb-text);
  font-family: var(--font-sans);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.form-input:focus {
  border-color: var(--color-cb-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-cb-accent) 12%, transparent);
}
.form-input::placeholder {
  color: var(--color-cb-muted);
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  border: 1.5px solid var(--color-cb-divider);
  background: transparent;
  color: var(--color-cb-muted);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background 0.15s ease, color 0.15s ease;
}
.btn-cancel:hover:not(:disabled) {
  background: var(--color-cb-field);
  color: var(--color-cb-text);
}
.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  border: none;
  background: var(--color-cb-accent);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: opacity 0.15s ease;
}
.btn-save:hover:not(:disabled) { opacity: 0.88; }
.btn-save:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  border: none;
  background: var(--color-cb-negative);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: opacity 0.15s ease;
}
.btn-delete:hover:not(:disabled) { opacity: 0.88; }
.btn-delete:disabled { opacity: 0.55; cursor: not-allowed; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Modal transition ── */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }

.modal-enter-active .skill-modal {
  animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1) both;
}
.modal-leave-active .skill-modal {
  animation: slideDown 0.18s ease both;
}

@keyframes slideUp {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes slideDown {
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(16px); opacity: 0; }
}

/* ── Dropdown transition ── */
.dropdown-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.dropdown-enter-from,
.dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
</style>