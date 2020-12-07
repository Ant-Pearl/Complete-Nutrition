<template>
  <div class="main container">
    <span class="welcome-message">{{ welcomeMsg }}</span>
    <form v-on:submit.prevent="findNutrient(foodType)">
      <input type="text" placeholder="cheerios" v-model="foodType" v-on:input="findSearchResults()"/>
      <div class="search-results">
        <div class="search-results-list">
          <div class="search-results-item" v-for="(item, index) in searchResults" :key='index'>
            <span>{{ item.description }} | Energy {{ item.energy }} | Protein {{ item.protein }}</span>
          </div>
        </div>
      </div>
      <button>Submit</button>
    </form>

    <div>Amount of protein: {{ nutrientsCount[1003] }} {{ nutrientsUnit[1003] }}</div>

  </div>
</template>

<script>
const axios = require('axios').default

export default {
  name: 'HelloWorld',
  props: {
    welcomeMsg: String
  },
  data() {
    return{
      foodType: "cheerios",
      foodTypeIndex: 0,
      //               energy   protein   b-12
      nutrientsCount: {1008: 0, 1003: 0, 1178: 0},
      nutrientsUnit: {1008: "KCAL", 1003: "G", 1178: "G"},
      searchScroll: 0,
      searchResults:[]
    }
  },
  methods: {
    findNutrient: function() {
      console.log(this.proteinCount)
      axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
        params: {
          query: this.foodType,
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        .then(res => {
          console.log(res.data)
          for (var key in this.nutrientsCount) {
            this.nutrientsCount[key] = res.data.foods[0].foodNutrients[this.findNutrientIndex(res.data.foods[0].foodNutrients, key)].value
            this.nutrientsUnit[key] = res.data.foods[0].foodNutrients[this.findNutrientIndex(res.data.foods[0].foodNutrients, key)].unitName
            console.log(this.nutrientsCount[key])
          }
        })
        .catch(err => {
          for (var key in this.nutrientsCount) {
            this.nutrientsCount[key] = "no results found"
          }
          console.error(err)
        })
    },

    findNutrientIndex: function(data, nutrient) {
      let i = 0
      console.log(data, data.length)
      while (nutrient != data[i].nutrientId) {
        //console.log(i, data[i].nutrientName)
        i++
      }
      return i;
    },

    findSearchResults: function() {
      axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
        params: {
          query: this.foodType,
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        .then(res => {
          console.log(res.data)
          let i = 0
          while(i < 30) {
            if (res.data.foods[i] == null) {
              this.searchResults.pop()
              console.log(i + " is false")
              console.log(i)
              console.log(res.data.foods[i])
            } else {
              if (this.searchResults[i] == null) {
                this.searchResults.push({
                  foodCode: 0,
                  description: "",
                  energy: 0,
                  protein: 0
                })
              }
              this.searchResults[i].description = res.data.foods[i].description
              this.searchResults[i].foodCode = res.data.foods[i].foodCode
              try {this.searchResults[i].energy = res.data.foods[i].foodNutrients[this.findNutrientIndex(res.data.foods[i].foodNutrients, 1008)].value} catch {this.searchResults[i].energy = 0}
              try {this.searchResults[i].protein = res.data.foods[i].foodNutrients[this.findNutrientIndex(res.data.foods[i].foodNutrients, 1003)].value} catch {this.searchResults[i].protein = 0}
              console.log(this.nutrientsCount[i])
            }
            i++
          }
        })
        .catch(err => {console.error(err)})
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
a {
  color: #42b983;
}
.container {
  max-width: 1150px;
  margin: 0 auto;
  padding: 0 .5em;
}

.search-results {
  display: flex;
  justify-content: center;
}
.search-results-list {
  display: block;
  margin: 0 20px 0 20px;
  border: 1px solid black;
  max-height: 300px;
  overflow: scroll;
}

.search-results-item {
  padding: 5px;
  text-align: left;
}
.search-results-item:hover {
  background: #DDDDDD;
}

</style>
