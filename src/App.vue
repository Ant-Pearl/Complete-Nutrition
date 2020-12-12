<template>
  <div id="app">
    <img class="apple-img" alt="Apple" src="./assets/burger-fries.png">
    <foodFinder msg="Welcome to Your Vue.js App"/>
    <mainFooter/>
  </div>
</template>

<script>
import foodFinder from './components/foodFinder.vue'
import mainFooter from './components/mainFooter.vue'

export default {
  name: 'App',
  components: {
    foodFinder,
    mainFooter
  }
}

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  background: #FFFBD0;
}
.apple-img {
  width: 20%;
  height: auto;
}
</style>
