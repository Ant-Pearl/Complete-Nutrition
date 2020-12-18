<template>
  <div class="main container">
    <input class="search-input" type="text" placeholder="courtney is a cutie" v-model="searchQuery" v-on:input="findSearchResults()"/>
    <div class="row">
      <div class="search row-item" v-bind:style='{"display": searchDisplay}'>
        <div class="search-results">
          <div class="sr-item" v-for="(item, index) in searchResults" :key='index'>
            <span class="sri-info">
              <div class="sri-info-row food-title1">{{ item.description }}</div>
              <div class="sri-info-row">Calories {{ item.energy }} Per 100g | Protein {{ item.protein }}g Per 100g</div>
            </span>
            <button class="sri-btn btn" v-on:click="addToDiet(item.fdcId)">Add to Diet</button>
          </div>
        </div>
      </div>
      <div class="diet row-item" v-bind:style='{"display": dietDisplay}'>
        <div class="d-item" v-for="(item, index) in diet" :key='index'>
          <img class="x-icon" src="@/assets/x-icon.png" alt="x-icon">
          <span class="di-info">
            <span class="di-title food-title1">{{ item.description }}</span>
            <span class="di-amount">Weight: <input class="di-input num-input" type="number" v-model="item.weight">Grams</span>
          </span>
          <button class="di-btn btn" v-on:click="displayNutrientList(index)">More Details</button>
        </div>
      </div>
      <div class="nutrition-specifics row-item" v-bind:style='{"display": nutrientDisplay}'>
        <div v-if="diet.length > 0">
          <div class="ns-back-arrow-wrapper">
            <img class="back-arrow ns-back-arrow" src="@/assets/back-arrow.png" alt="x-icon">
            <span class="ns-back-arrow-text">Back to Diet</span>
          </div>
          <span class="nsi-info food-title1">{{ diet[nutrientListDietReferenceIndex].description }}</span>
          <div class="ns-item" v-for="(item, index) in diet[nutrientListDietReferenceIndex].nutrients" :key='index'>
            <span class="nsi-info">{{ item.nutrientName }} | Value {{ item.value }} {{ item.unitName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require('axios').default

export default {
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  data() { 
    return {
      searchQuery: "cheerios",
      searchDisplay: "none",
      dietDisplay: "none",
      nutrientDisplay: "none",
      nutrientListDietReferenceIndex: 0,
      //               energy   protein   b-12
      nutrientsCount: {1008: 0, 1003: 0, 1178: 0},
      nutrientsUnit: {1008: "KCAL", 1003: "G", 1178: "G"},
      searchScroll: 0,
      searchResults:[],
      diet:[],
      nutrients: []
    }
  },
  methods: {
    addToDiet: function(fdcId) {
      if (this.diet == []) {
        this.dietDisplay = "none"
      } else {
        this.dietDisplay = "block"
        this.nutrientDisplay = "none"
      }
      console.log("Requesting fdcId " + fdcId)
      axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
        params: {
          query: fdcId,
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        .then(res => {
          console.log("Food Received")
          console.log(res.data.foods[0])
          let isNew = true
          for (let i in this.diet) {
            if (this.diet[i].fdcId == res.data.foods[0].fdcId) {
              this.diet[i].weight = parseInt(this.diet[i].weight) + 100
              isNew = false
            }
          }
          if (isNew) {
            this.diet.push({
              fdcId: fdcId,
              description: res.data.foods[0].description,
              energy: this.findNutrientValue(res.data.foods[0].foodNutrients, 1008).value,
              protein: this.findNutrientValue(res.data.foods[0].foodNutrients, 1003).value,
              nutrients: [],
              weight: 100,
            })
          }
        })
        .catch(err => {console.error(err)})
    },

    findSearchResults: function() {
      if (this.searchQuery == "") {
        this.searchDisplay = "none"
      } else {
        this.searchDisplay = "block"
      }
      axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
        params: {
          query: this.searchQuery,
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        .then(res => {
          console.log(res.data)
          let i = 0
          this.searchResults = []
          while(i < 30) {
            if (res.data.foods[i] != null) {
              this.searchResults.push({
                fdcId: res.data.foods[i].fdcId,
                description: res.data.foods[i].description,
                energy: this.findNutrientValue(res.data.foods[i].foodNutrients, 1008).value,
                protein: this.findNutrientValue(res.data.foods[i].foodNutrients, 1003).value
              })
            } else {
              break
            }
            i++
          }

        })
        .catch(err => {console.error(err)})
    },

    displayNutrientList: function(dietIndex) {
      this.nutrientDisplay = "block"
      this.dietDisplay = "none"
      this.nutrientListDietReferenceIndex = dietIndex

      axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
        params: {
          query: this.diet[dietIndex].fdcId,
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        .then(res => {
          console.log("Food object for nutrients list")
          console.log(res.data.foods[0])
          this.diet[dietIndex].nutrients = []
          for (let i in res.data.foods[0].foodNutrients) {
            if (res.data.foods[0].foodNutrients[i] != null) {
              this.diet[dietIndex].nutrients.push({
                nutrientName: res.data.foods[0].foodNutrients[i].nutrientName,
                value: res.data.foods[0].foodNutrients[i].value,
                unitName: res.data.foods[0].foodNutrients[i].unitName
              })
            } else {
              break
            }
          }

        })
        .catch(err => {console.error(err)})
    },

    findNutrientValue: function(data , nutrient) {
      let i = 0
      //console.log(data, data.length)
      try {
        while (nutrient != data[i].nutrientId || i >= data.length) {
          //console.log(i, data[i].nutrientName)
          i++
        }
        return {
          value: data[i].value,
          unitName: data[i].unitName,
          index: i
        }
      }
      catch {
        return {
          value: 0,
          unitName: "G",
          index: 0
        }
      }
    },

    gayFunction: function() {
      console.log("courtney is gay")
    }
  }
}

// axios.post('https://api.edamam.com/api/nutrition-details?app_id=6596bd25&app_key=47da9da3b200ecb5dfb4b9fe74320ec6', {
//   title: "",
//   yield: "1 cup"
// })
//   .then(res => console.log(res))
//   .then(err => console.err(err))
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}


.container {
  max-width: 1150px;
  margin: 0 auto;
  padding: 0 .5em;
  background: #fefefe;
}

.row {
  display: flex;
  justify-content: space-between;
}

.row-item {
  flex-basis: 0;
  flex-grow: 1;
  margin: 20px;
}

.food-title1 {
  font-weight: bold;
  display: block;
}

.btn {
  background: #FF9900;
  border: 2px solid #C13100;
  font-weight: bold;
  transition: all .3s;
}

.btn:hover {
  background: #C13100;
}

.num-input {
  border: 2px solid black;
  background: #eeeeee;
  font-weight: bold;
}

.x-icon {
  width: 15px;
  height: 15px;
  padding: 5px;
  filter: grayscale(100%);
  transition: filter .15s;
}

.x-icon:hover {
  filter: grayscale(0%);
}

/* --------------------------------------------SPECIFICS-------------------------------------------*/


.search-input {
  margin-bottom: 5px;
  width: 300px;
  font-size: 1.25em;
}

.search-results {
  display: block;
  border: 1px solid black;
  max-height: 300px;
  overflow: scroll;
  overflow-x: hidden;
}

.sr-item {
  display: flex;
  padding: 5px;
  text-align: center;
  justify-content: space-between;
}
.sr-item:hover {
  background: rgba(0, 0, 0, .1);
}

.sri-info {
  display: block;
  width: 85%;
}

.sri-info-row {
  flex-wrap: wrap;
}

.sri-btn {
  margin-left: 2%;
  width: 15%;
}


.diet {
  display: block;
  max-height: 300px;
  border: 1px solid black;
  overflow: scroll;
  overflow-x: hidden;
}

.d-item {
  display: flex;
  border-bottom: 1px solid black;
  padding: 5px
}

.di-info {
  display: block;
  width: 85%;
}

.di-amount {
  display: inline-block;
}

.di-input {
  width: 5em;
  font-size: 1em;
}

.di-btn {
  margin-left: 2%;
  width: 15%;
}


.nutrition-specifics {
  display: block;
  max-height: 300px;
  border: 1px solid black;
  overflow: scroll;
  overflow-x: hidden;
}
.ns-item {
  border-bottom: 1px dotted black;
  margin: 2px;
}

.ns-back-arrow-wrapper {
  display: block;
  position: absolute;
  border: 1px solid black;
  margin: 2px;
  background: #FF9900;
  transition: all .3s;
}

.ns-back-arrow {
  width: 30px;
  height: 30px;
  padding: 5px 0 5px;
}

.ns-back-arrow-text{
  display: none;
  margin: auto;
}

.ns-back-arrow-wrapper:hover {
  background: #C13100;
}

.ns-back-arrow-wrapper:hover .ns-back-arrow-text{
  display: inline;
}


</style>
