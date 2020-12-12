<template>
  <div class="main container">
    <input class="search-input" type="text" placeholder="courtney is a cutie" v-model="searchQuery" v-on:input="findSearchResults()"/>
    <div class="row">
      <div class="search row-item" v-bind:style='{"display": searchDisplay}'>
        <div class="search-results">
          <div class="sr-item" v-for="(item, index) in searchResults" :key='index'>
            <span class="sri-info">
              <div class="sri-info-row">{{ item.description }}</div>
              <div class="sri-info-row">Calories {{ item.energy }} Per 100g | Protein {{ item.protein }}g Per 100g</div>
            </span>
            <button class="sri-btn" v-on:click="addToDiet(item.fdcId)">Add to Diet</button>
          </div>
        </div>
      </div>
      <div class="diet row-item" v-bind:style='{"display": dietDisplay}'>
        <div class="d-item" v-for="(item, index) in diet" :key='index'>
          <span class="di-info">{{ item.description }} | Calories {{ item.energy }} Per 100g | Protein {{ item.protein }}g Per 100g</span>
          <button class="di-btn">--></button>
          <input class="di-amount" type="number" v-model="item.weight">
        </div>
      </div>
    </div>

    <div>Amount of protein: {{ nutrientsCount[1003] }} {{ nutrientsUnit[1003] }}</div>

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
      //               energy   protein   b-12
      nutrientsCount: {1008: 0, 1003: 0, 1178: 0},
      nutrientsUnit: {1008: "KCAL", 1003: "G", 1178: "G"},
      searchScroll: 0,
      searchResults:[],
      diet:[]
    }
  },
  methods: {
    addToDiet: function(fdcId) {
      if (this.diet == []) {
        this.dietDisplay = "none"
      } else {
        this.dietDisplay = "block"
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
                fdcId: 0,
                description: "",
                energy: 0,
                protein: 0
              })
              this.searchResults[i].description = res.data.foods[i].description
              this.searchResults[i].fdcId = res.data.foods[i].fdcId
              this.searchResults[i].energy = this.findNutrientValue(res.data.foods[i].foodNutrients, 1008).value
              this.searchResults[i].protein = this.findNutrientValue(res.data.foods[i].foodNutrients, 1003).value
            } else {
              break
            }
            i++
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
  background: #FF9900;
  border: 2px solid #C13100;
  margin-left: 2%;
  font-weight: bold;
  width: 15%;
  transition: all .3s;
}

.sri-btn:hover {
  background: #C13100;
}

.diet {
  display: block;
  max-height: 300px;
  border: 1px solid black;
  overflow: scroll;
  overflow-x: hidden;
}

.d-item {
  border-bottom: 1px solid black;
}

</style>
