<template>
  <div class="dashboard-container">
    <div class="dashboard-text">
      {{ name }}
      {{ $store.getters.menuList }}
      <!-- {{ $store.getters.refresh }}
      {{ $store.getters.menuList }} -->
    </div>
  </div>
</template>

<script>
import api from '@/api/test'
import { PcCookie, Key } from '@/utils/cookie'

export default {
  name: 'Dashboard',

  data() {
    return {
      name: {}
    }
  },
  created() {
    this.fetchData()
    this.getUserinfo()
  },

  methods: {
    fetchData() {
      api.test().then(response => {
        console.log(response)
        this.name = response
      })
    },
    getUserinfo() {
      const Userinfo = PcCookie.get(Key.userInfoKey)
      console.log(Userinfo)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
