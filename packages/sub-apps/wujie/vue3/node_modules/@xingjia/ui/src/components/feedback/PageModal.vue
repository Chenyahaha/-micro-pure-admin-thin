<script setup lang="ts">
import { computed } from 'vue';

const visible = defineModel<boolean>('visible', { required: true });

const props = defineProps<{
    title?: string;
    width?: number | string;
    containerSelector?: string;
    mask?: boolean;
    maskClosable?: boolean;
    unmountOnClose?: boolean;
    height?: number | string;
}>();

const emit = defineEmits<{
    cancel: [];
    ok: [];
}>();

const mergedWidth = computed(() => props.width ?? 560);
const mergedContainerSelector = computed(() => props.containerSelector ?? '.page-popup-container');
const mergedMask = computed(() => props.mask ?? false);
const mergedMaskClosable = computed(() => props.maskClosable ?? false);
const mergedUnmountOnClose = computed(() => props.unmountOnClose ?? false);
const mergedHeight = computed(() => props.height ?? 400);

function handleCancel() {
    emit('cancel');
}

function handleOk() {
    emit('ok');
}
</script>

<template>
    <a-modal
        v-model:visible="visible"
        :title="title"
        :height="mergedHeight"
        :width="mergedWidth"
        :popup-container="mergedContainerSelector"
        :mask="mergedMask"
        :maskClosable="mergedMaskClosable"
        :unmount-on-close="mergedUnmountOnClose"
        class="page-modal"
        @cancel="handleCancel"
        @ok="handleOk"
    >
        <a-scrollbar :style="{ height: mergedHeight + 'px', overflow: 'auto' }">
            <slot />
        </a-scrollbar>
        <template v-if="$slots.footer" #footer>
            <slot name="footer" />
        </template>
    </a-modal>
</template>
