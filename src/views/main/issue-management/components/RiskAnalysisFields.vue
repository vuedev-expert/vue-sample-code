<template>
  <div class="flex gap-12 lg:gap-16 mb-3">
    <div>
      <h6 class="mt-[45px] text-lg">Why?</h6>
    </div>
    <div class="form-item flex-1">
      <h2 class="text-lg font-bold text-primary-500 mb-3">Question</h2>
        <input
            v-model="state.question"
            type="text"
            class="form-input"
            :disabled="disabled"
        >
<!--        <p v-if="v$.question.$errors.length" class="form-error-message">-->
<!--          {{ v$.question.$errors[0].$message }}-->
<!--        </p>-->
    </div>
    <div
        class="form-item flex-1"
    >
      <h2 class="text-lg font-bold text-primary-500 mb-3">Answer</h2>
      <input
          v-model="state.answer"
          type="text"
          class="form-input"
          :disabled="disabled"
      >
<!--      <p v-if="v$.answer.$errors.length" class="form-error-message">-->
<!--        {{ v$.answer.$errors[0].$message }}-->
<!--      </p>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import {PropType, ref} from 'vue'

interface fieldType {
  question: string
  answer: string
}
const props = defineProps({
  analysisFields: { type: Object as PropType<fieldType> },
  disabled: { type: Boolean, default: false }
})

const state = ref<fieldType | undefined>(props.analysisFields)
</script>

<style scoped>
.arrow{
  position:relative;
  width: 80px;
  margin: 50px auto 20px;
  height: 0;
  border-bottom: 25px solid rgb(168 126 58);
}
.arrow::before{
  content: 'Why?';
  position: absolute;
  left: 20px;
  top: 2px;
  color: white;

}
.arrow::after {
  content: '';
  width: 0;
  height: 0;
  border-top: 22px solid transparent;
  border-bottom: 20px solid transparent;
  border-left: 40px solid rgb(168 126 58);
  position: absolute;
  right: -30px;
  top: -9px;
}
</style>
