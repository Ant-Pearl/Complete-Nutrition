<template>
  <div class="main container food-finder">
    <input class="search-input" type="text" placeholder="Search your food here" v-model="searchQuery" v-on:input="findSearchResults()"/>
    <select v-model="branded" v-on:input="findSearchResults()" class="branded">
      <option value="true">Include branded</option>
      <option value="false">Don't include branded</option>
    </select>
    <div class="row">


      <div class="search row-item diet-builder-ri" v-bind:style='{"display": searchDisplay}'>
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


      <div class="diet row-item diet-builder-ri" v-bind:style='{"display": dietDisplay}'>
        <div class="d-item" v-for="(item, index) in diet" :key='index'>
          <img class="x-icon" src="@/assets/x-icon.png" alt="x-icon" v-on:click="deleteDietItem(index)">
          <span class="di-info">
            <span class="di-title food-title1">{{ item.description }}</span>
            <span class="di-amount">Weight: <input class="di-input num-input" type="number" v-model="item.weight" v-on:input="displayNutrientList(index, false)">Grams</span>
          </span>
          <button class="di-btn btn" v-on:click="displayNutrientList(index, true)">More Details</button>
        </div>
      </div>


      <div class="nutrition-specifics row-item diet-builder-ri" v-bind:style='{"display": nutrientDisplay}'>
        <div v-if="diet.length > 0">
          <div class="ns-back-arrow-wrapper" v-on:click="backToDiet()">
            <img class="back-arrow ns-back-arrow" src="@/assets/back-arrow.png" alt="x-icon">
            <span class="ns-back-arrow-text">Back to Diet</span>
          </div>
          <span class="nsi-info food-title1">{{ diet[nutrientListDietReferenceIndex].description }} ({{diet[nutrientListDietReferenceIndex].weight}}g)</span>
          <div class="ns-item" v-for="(item, index) in diet[nutrientListDietReferenceIndex].nutrients" :key='index'>
            <span class="nsi-info">{{ item.nutrientId }}{{ item.nutrientName }} | Value {{ item.value }} {{ item.unitName }}</span>
          </div>
        </div>
      </div>


    </div>


    <div class="diet-settings">
      <span class="header1">Diet Timeframe: </span>
      <input class="ds-timeframe" type="number" v-model="timeframe">
      <select class="ds-time-unit" v-model="timeMultiplier">
        <option value="1">Days</option>
        <option value="7">Weeks</option>
        <option value="30">Months</option>
    </select>
    </div>


    <button class="btn calculate-btn" v-on:click="compareDietToDailyValues()">Calculate Complete Nutrition</button>

    <div class="diet-report" v-bind:style='{"display": reportDisplay}'>
        <div class="dr-item" v-for="(item, index) in totalUserNutrition" :key='index'>
          <span class="dri-title header1">{{item.nutrientName}} </span>
          <span class="dri-info row">
            <span class="row-item">{{ index }} | Value: {{ item.value }} {{ reactiveDailyValue[index].unit }}</span>
            <span v-if="item.DVCompare == 'normal'" class="row-item drii-DVCompare-normal">{{ item.DVCompare }}</span>
            <span v-if="item.DVCompare == 'low' || item.DVCompare == 'high'" class="row-item drii-DVCompare-low-high">{{ item.DVCompare }}</span>
            <span v-if="item.DVCompare == 'slightly low' || item.DVCompare == 'slightly high'" class="row-item drii-DVCompare-slightly">{{ item.DVCompare }}</span>
          </span>
          <span class="dri-more-info">
            <button @click="moreInfoToggle(index)" class="btn drimi-btn drimi-row">
              <span v-if="item.moreInfoToggle">Less Info</span>
              <span v-if="!item.moreInfoToggle">More Info</span>
            </button>
            <span class="drimi-content" v-if="item.moreInfoToggle">
              <div class="drimi-row drimi-category header2">Daily Values</div>
              <div class="drimi-row">Minimum: {{ reactiveDailyValue[index].min }} {{ reactiveDailyValue[index].unit }} | Maxiumum: {{ reactiveDailyValue[index].max }} {{ reactiveDailyValue[index].unit }}</div>
              <div class="drimi-row drimi-category header2">Timeframe Values</div>
              <div class="drimi-row">Minimum: {{ reactiveTimeframeValue[index].min }} {{ reactiveTimeframeValue[index].unit }} | Maxiumum: {{ reactiveTimeframeValue[index].max }} {{ reactiveTimeframeValue[index].unit }}</div>
              <div class="drimi-row drimi-category header2">Reference</div>
              <div class="drimi-row"><a :href="reactiveDailyValue[index].reference">{{ reactiveDailyValue[index].reference }}</a></div>
            </span>
          </span>
        </div>
    </div>

  </div>
</template>

<script>
import dailyValue from '@/assets/daily-value.json'
const axios = require('axios').default

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() { 
    return {
      searchQuery: "cheerios",
      searchDisplay: "none",
      dietDisplay: "none",
      nutrientDisplay: "none",
      reportDisplay: "none",
      displayNutrientListBlockingVariable: true,
      branded: "true",
      timeframe: 1,
      timeMultiplier: "1",
      nutrientListDietReferenceIndex: 0,
      searchScroll: 0,

      searchResults:[],
      diet:[],
      totalUserNutrition:{},
      totalUserNutritionReactive:[],
      reactiveDailyValue: dailyValue,
      reactiveTimeframeValue: {}
    }
  },
  methods: {




findSearchResults: function() {
      if (this.searchQuery == "") {
        this.searchDisplay = "none"
      } else {
        this.searchDisplay = "block"
      }
      return axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
        params: {
          query: this.searchQuery,
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        .then(res => {
          console.log(res.data)
          let i = 0
          let resultsLength = 30
          this.searchResults = []
          while(i < resultsLength) {
            if (res.data.foods[i] != null) {
              if (!(res.data.foods[i].dataType == "Branded" && this.branded == "false")) {
                this.searchResults.push({
                  fdcId: res.data.foods[i].fdcId,
                  description: res.data.foods[i].description,
                  energy: this.findNutrientValue(res.data.foods[i].foodNutrients, 1008).value,
                  protein: this.findNutrientValue(res.data.foods[i].foodNutrients, 1003).value
                })
              }
              else {
                resultsLength++
              }
            } else {
              break
            }
            i++
          }

          if (this.searchResults.length == 0) {
            this.searchDisplay = "none"
          } else {
            this.searchDisplay = "block"
          }
        })
        .catch(err => {console.error(err)})
    },




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
              this.displayNutrientList(i, false)
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
            //updating the nutrients list
            this.displayNutrientList(this.diet.length-1, false)
          }
        })
        .catch(err => {console.error(err)})
    },




    displayNutrientList: function(dietIndex, displayBool) {
      if (displayBool) {
        this.nutrientDisplay = "block"
        this.dietDisplay = "none"
      }
      this.nutrientListDietReferenceIndex = dietIndex
      this.displayNutrientListBlockingVariable = true
      console.log("Api call inside displayNutrientList is happening now")
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
          let foodScaleMultiplier = this.diet[dietIndex].weight/100
          let currentNutrientValue = 0
          for (let i in res.data.foods[0].foodNutrients) {
            currentNutrientValue = +(res.data.foods[0].foodNutrients[i].value*foodScaleMultiplier).toFixed(3)
            if (res.data.foods[0].foodNutrients[i] != null) {
              console.log("pushing " + i + " to dietIndex:" + dietIndex)
              this.diet[dietIndex].nutrients.push({
                nutrientId: res.data.foods[0].foodNutrients[i].nutrientId,
                nutrientName: res.data.foods[0].foodNutrients[i].nutrientName,
                value: currentNutrientValue,
                unitName: res.data.foods[0].foodNutrients[i].unitName
              })
            } else {
              this.displayNutrientListBlockingVariable = false
              break
            }
          }
          this.displayNutrientListBlockingVariable = false

        })
        .catch(err => {console.error(err)})
      console.log("end of displayNutrientList")
      console.log(this.totalUserNutrition)
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

    backToDiet: function() {
      this.dietDisplay = "block"
      this.nutrientDisplay = "none"
    },

    deleteDietItem: function(i) {
      this.diet.splice(i, 1)
      this.nutrientListDietReferenceIndex = 0
      if (this.diet.length == 0) {
        this.dietDisplay = "none"
      }
    },

    // toggles the more info reference of a specified index in totalUserNutrition
    moreInfoToggle: function(index) {
      if (this.totalUserNutrition[index].moreInfoToggle == false){
        this.totalUserNutrition[index].moreInfoToggle = true
      } else {
        this.totalUserNutrition[index].moreInfoToggle = false
      }
      let objectTempReactivityVariable = this.totalUserNutrition
      this.totalUserNutrition = {}
      this.totalUserNutrition = objectTempReactivityVariable
    },

    totalUpDietNutrition: function() {
      // let userNutritionKeys = Object.keys(this.totalUserNutrition)
      // console.log(userNutritionKeys)
      for(let i in this.diet) {
        console.log("Calculating nutrition facts based on weight for this.diet[" + i + "]")
        for (let n in this.diet[i].nutrients) {
          console.log(this.diet[i].nutrients)
          console.log("n is " + n)
          console.log("attempting to print data")

          console.log(this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId] == undefined)
          if (this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId] == undefined) {
            this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId] = {value: 0, nutrientName: this.diet[i].nutrients[n].nutrientName, DVCompare: "normal", moreInfoToggle: false}
            // checking reactive daily value for data on the nutrient in question
            if (this.reactiveDailyValue[this.diet[i].nutrients[n].nutrientId] == undefined) {
              this.reactiveDailyValue[this.diet[i].nutrients[n].nutrientId] = {name: this.diet[i].nutrients[n].nutrientName, min: 0, max: 999999, unit: this.diet[i].nutrients[n].unit, reference: "none"}
              console.log("Reactive Daily Value new entry")
              console.log(this.reactiveDailyValue[this.diet[i].nutrients[n].nutrientId])
            }
          }
          this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId].value = this.diet[i].nutrients[n].value + this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId].value
          console.log(this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId].value)
          //console.log(this.totalUserNutrition.parseInt(this.diet[i].nutrients[n].fcdId))
        }
        console.log("finished with this.diet[" + i + "]")
        
      }
      // TotalUserNutrition should be added up with everhthing from this.diet
      console.log(this.totalUserNutrition)
      console.log(this.totalUserNutrition[1003])
    },

    compareDietToDailyValues: function() {
      console.log("totaling up nutrition")
      this.totalUserNutrition = {}
      let tempJSONDVString = JSON.stringify(dailyValue)
      this.reactiveDailyValue = JSON.parse(tempJSONDVString)
      this.totalUpDietNutrition()
      tempJSONDVString = JSON.stringify(this.reactiveDailyValue)
      this.reactiveTimeframeValue = JSON.parse(tempJSONDVString)
      //comparing diet nutrient totals to daily value data
      for(let i in this.reactiveTimeframeValue) {
        console.log("now working with nutrient " + i)
        //let minimumTimeframeValue = this.reactiveTimeframeValue[i].min * this.timeframe * parseInt(this.timeMultiplier)

        // updating reactiveTimeframeValue to match timeframe
        this.reactiveTimeframeValue[i].min = this.reactiveTimeframeValue[i].min * this.timeframe * parseInt(this.timeMultiplier)
        this.reactiveTimeframeValue[i].max = this.reactiveTimeframeValue[i].max * this.timeframe * parseInt(this.timeMultiplier)
        // starting at a baseline normal value
        if (this.totalUserNutrition[i] == undefined) {
          this.totalUserNutrition[i] = {value: 0, nutrientName: this.reactiveTimeframeValue[i].name, DVCompare: "normal", moreInfoToggle: false}
        }
        // checking if too low
        if (this.reactiveTimeframeValue[i].min > this.totalUserNutrition[i].value) {
          this.totalUserNutrition[i].DVCompare = "low"
          console.log(this.reactiveTimeframeValue[i].min*.7)
          console.log(this.reactiveTimeframeValue[i].max + this.reactiveTimeframeValue[i].min*.3)
          if (this.reactiveTimeframeValue[i].min*.7 < this.totalUserNutrition[i].value) {
            console.log("slightly low")
            this.totalUserNutrition[i].DVCompare = "slightly low"
          }
        }
        // checking if too high
        if (this.reactiveTimeframeValue[i].max < this.totalUserNutrition[i].value) {
          this.totalUserNutrition[i].DVCompare = "high"
          if (this.reactiveTimeframeValue[i].max + this.reactiveTimeframeValue[i].min*.3 > this.totalUserNutrition[i].value) {
            this.totalUserNutrition[i].DVCompare = "slightly high"
          }
        }
      }
      console.log("rtimeframe")
      console.log(this.reactiveTimeframeValue["1003"].min)
      console.log(this.reactiveTimeframeValue)
      console.log("rdaily")
      console.log(this.reactiveDailyValue["1003"].min)
      console.log(this.reactiveDailyValue)
      console.log("daily")
      console.log(dailyValue["1003"].min)
      console.log(dailyValue)
      console.log(this.totalUserNutrition)
      this.reportDisplay = "block"
    }
  }
}

</script>

<!-- totalUserNutrition data structure
{
  value: 0, 
  nutrientName: dailyValue[i].name, 
  DVCompare: "normal", 
  moreInfoToggle: false
}
-->


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
  padding: .5em .5em;
  background: #fefefe;
}

.row {
  display: flex;
  justify-content: space-between;
}

.row-item {
  flex-basis: 0;
  flex-grow: 1;
}

.diet-builder-ri {
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
  box-shadow: 2px 3px 6px black;
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

.header1 {
  font-weight: bold;
  font-size: 1.1em;
}

.header2 {
  font-weight: bold;
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

/* DIET */

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

/* NUTRITION SPECIFICS */

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
  box-shadow: 2px 3px 6px black;
  transition: all 1s;
}

.ns-back-arrow {
  width: 25px;
  height: 25px;
  padding: 5px 0 5px 0px;
  vertical-align: middle;
}

.ns-back-arrow-text{
  display: inline-block;
  white-space: nowrap;
  margin: 0;
  padding-top: 2px;
  color: black;
  vertical-align: middle;
  font-stretch: ultra-condensed;
  width: 0px;
  transition: all 1s;
  overflow: hidden;
}

.ns-back-arrow-wrapper:hover {
  background: #C13100;
}

.ns-back-arrow-wrapper:hover .ns-back-arrow-text{
  display: inline-block;
  width: 100px;
  font-stretch: normal;
}

/* DIET REPORT */

.dr-item * {
  /*display: block;*/
}

.dr-item {
  margin: 10px 0 10px 0;
}
.dri-title {
  
}

.drii-DVCompare-normal {
  color: green;
}
.drii-DVCompare-low-high {
  color: red;
}
.drii-DVCompare-slightly {
  color: orange
}

.drimi-row {
  margin: .2em 0 .2em 0
}
/* DIET SETTINGS */
.diet-settings {
  margin-bottom: 1em;
}
.ds-timeframe {
  width: 35px;
}

</style>
