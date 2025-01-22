<script setup lang="ts">
import type { Database } from '~/types/database'

type Job = Database['public']['Tables']['jobs']['Row']

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
      <h2 class="card-title mb-4">Job Details</h2>
      <div class="space-y-4">
        <!-- Description -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea 
            v-model="modelValue.description"
            class="textarea textarea-bordered h-24"
          />
        </div>

        <!-- Tasks -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Tasks</span>
          </label>
          <textarea 
            v-model="modelValue.tasks"
            class="textarea textarea-bordered h-24"
          />
        </div>

        <!-- Requirements -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Requirements</span>
          </label>
          <textarea 
            v-model="modelValue.requirements"
            class="textarea textarea-bordered h-24"
          />
        </div>

        <!-- Benefits -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Benefits</span>
          </label>
          <textarea 
            v-model="modelValue.benefits"
            class="textarea textarea-bordered h-24"
          />
        </div>
      </div>
    </div>
  </div>
</template> 