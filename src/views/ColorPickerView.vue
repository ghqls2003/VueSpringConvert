<template>
  <div>
    <ColorPicker />
  </div>
</template>

<script>
// @ is an alias to /src
import ColorPicker from '@/components/picker/ColorPicker.vue'

export default {
  name: 'AboutView',
  components: {
    ColorPicker
  }
}
</script>
