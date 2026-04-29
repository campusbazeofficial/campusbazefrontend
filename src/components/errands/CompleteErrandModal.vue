<template>
  <div
    class="fixed inset-0 z-300 flex items-end justify-center bg-cb-overlay p-0 backdrop-blur-sm sm:items-center sm:p-4"
    @click.self="$emit('close')"
  >
    <div class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-cb-base shadow-2xl sm:max-w-md sm:rounded-2xl">
      <!-- Mobile handle -->
      <div class="flex justify-center pb-1 pt-3 sm:hidden">
        <div class="h-1 w-10 rounded-full bg-cb-divider"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-cb-divider px-6 py-4">
        <div>
          <h3 class="flex items-center gap-2 text-base font-bold text-cb-text">
            <i class="fa-solid fa-circle-check text-cb-accent"></i>
            Complete Errand
          </h3>
          <p class="mt-0.5 text-xs text-cb-muted">Upload proof of completion</p>
        </div>
        <button
          @click="$emit('close')"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
        >
          <i class="fa-solid fa-times text-sm"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="errand" class="mb-4 rounded-xl border border-cb-divider bg-cb-card p-3.5">
          <p class="line-clamp-1 text-sm font-bold text-cb-text capitalize">{{ errand.title }}</p>
          <p class="text-xs text-cb-muted">Budget: ₦{{ errand.budget?.toLocaleString() }}</p>
        </div>

        <!-- File upload area -->
        <div>
          <label class="mb-2 block text-xs font-semibold text-cb-text">
            Proof of completion <span class="text-cb-negative">*</span>
          </label>
          
          <div
            v-if="!previewUrl"
            :class="[
              'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all',
              dragActive
                ? 'border-cb-accent bg-cb-accent-subtle'
                : error
                  ? 'border-cb-negative/50 bg-cb-negative-subtle'
                  : 'border-cb-divider bg-cb-card hover:border-cb-accent-muted hover:bg-cb-field',
            ]"
            @click="triggerFileInput"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              class="hidden"
              @change="handleFileSelect"
            />
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-cb-accent-subtle">
              <i class="fa-solid fa-cloud-arrow-up text-2xl text-cb-accent-muted"></i>
            </div>
            <p class="mb-1 text-sm font-semibold text-cb-text">Click or drag to upload</p>
            <p class="text-xs text-cb-muted">PNG, JPG, GIF, PDF up to 10MB</p>
          </div>

          <!-- Preview -->
          <div v-else class="relative rounded-xl border border-cb-divider bg-cb-card p-4">
            <button
              @click="clearFile"
              class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-cb-negative text-white transition-opacity hover:opacity-90"
            >
              <i class="fa-solid fa-times text-xs"></i>
            </button>
            
            <div v-if="isImage" class="flex justify-center">
              <img :src="previewUrl" class="max-h-48 rounded-lg object-contain" alt="Preview" />
            </div>
            <div v-else class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-cb-field">
                <i class="fa-solid fa-file-pdf text-xl text-cb-negative"></i>
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-cb-text">{{ selectedFile?.name }}</p>
                <p class="text-xs text-cb-muted">{{ formatFileSize(selectedFile?.size) }}</p>
              </div>
            </div>
          </div>

          <p v-if="error" class="mt-2 text-xs text-cb-negative">{{ error }}</p>
        </div>

        <!-- Optional note -->
        <div class="mt-4">
          <label class="mb-2 block text-xs font-semibold text-cb-text">
            Additional notes (optional)
          </label>
          <textarea
            v-model="note"
            rows="3"
            maxlength="300"
            placeholder="Add any notes for the poster..."
            class="w-full resize-none rounded-xl border border-cb-divider bg-cb-card px-3.5 py-3 text-sm text-cb-text outline-none transition-colors placeholder:text-cb-muted-40 focus:border-cb-accent"
          ></textarea>
          <p class="mt-1 text-right text-[10px] text-cb-muted-40">{{ note.length }}/300</p>
        </div>

        <!-- Store error -->
        <div
          v-if="storeError"
          class="mt-4 flex items-start gap-2.5 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle p-3"
        >
          <i class="fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-sm text-cb-negative"></i>
          <p class="text-xs text-cb-negative">{{ storeError }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex gap-3 border-t border-cb-divider bg-cb-card/30 px-6 py-4">
        <button
          @click="$emit('close')"
          class="flex-1 rounded-xl border border-cb-divider bg-cb-card px-4 py-3 text-sm font-semibold text-cb-text transition-colors hover:bg-cb-field"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="loading || !selectedFile"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent px-4 py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-md disabled:opacity-60"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin text-xs"></i>
          <i v-else class="fa-solid fa-check text-xs"></i>
          Complete errand
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  errand: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  storeError: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'close'])

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)
const note = ref('')
const dragActive = ref(false)
const error = ref('')

const isImage = computed(() => {
  return selectedFile.value?.type?.startsWith('image/')
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  validateAndSetFile(file)
}

function handleDrop(event) {
  dragActive.value = false
  const file = event.dataTransfer?.files?.[0]
  validateAndSetFile(file)
}

function validateAndSetFile(file) {
  error.value = ''
  
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    error.value = 'Invalid file type. Please upload an image or PDF.'
    return
  }

  if (file.size > maxSize) {
    error.value = 'File size exceeds 10MB limit.'
    return
  }

  selectedFile.value = file
  
  if (file.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }
}

function clearFile() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  error.value = ''
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function handleSubmit() {
  if (!selectedFile.value) {
    error.value = 'Please upload proof of completion'
    return
  }
  emit('confirm', { file: selectedFile.value, note: note.value })
}

// Clean up object URL
watch(previewUrl, (newUrl, oldUrl) => {
  if (oldUrl) URL.revokeObjectURL(oldUrl)
})
</script>