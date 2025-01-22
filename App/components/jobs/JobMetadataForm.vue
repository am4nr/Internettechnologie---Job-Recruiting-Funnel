<!-- components/jobs/JobMetadataForm.vue -->
<script setup lang="ts">
import type { Job } from '~/types/form'

const props = defineProps<{
  modelValue: Job
}>()

defineEmits<{
  (e: 'update:modelValue', value: Job): void
}>()
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-4">Basic Information</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Title -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Job Title</span>
          </label>
          <input 
            v-model="modelValue.title"
            type="text" 
            class="input input-bordered" 
            required
          />
        </div>

        <!-- Location -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Location</span>
          </label>
          <input 
            v-model="modelValue.location"
            type="text" 
            class="input input-bordered"
          />
        </div>

        <!-- Status -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Status</span>
          </label>
          <select 
            v-model="modelValue.status"
            class="select select-bordered"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <!-- Description -->
      <div class="form-control mt-4">
        <label class="label">
          <span class="label-text">Description</span>
        </label>
        <textarea 
          v-model="modelValue.description"
          class="textarea textarea-bordered h-24"
        ></textarea>
      </div>
    </div>
  </div>
</template>