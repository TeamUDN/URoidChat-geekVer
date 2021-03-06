const quiz = new Vue({
  el: '#quizArea',
  // FlaskとVueを共存させるためにDelimiterを変更する
  delimiters: ["[[", "]]"],
  data: {
    selectQuiz: true,
    askQuestion: false,
    yourResult: false,
    quizNameOption: true,
    quizAnswerOption: false,
    resultRanking: false,
    optionBtnDisabled: false,
    nextQuizBtnDisabled: true,
    quizAnsShowControl: false,
    info: null,
    quiz: null,
    ranking: null,
    quizNumArr: [],
    quizName: '',
    selectQuizNum: 0,
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    answerNum: '',
    answerText: '',
    questionNumUse: 0,
    questionNumShow: 1,
    trueCounter: 0,
    nextQuestionBtnText: '次の問題',
    answerImageSrc: 'true',
    NationalFlagCheck: false,
    NationalFlagImg: 'America.png',
    timerStart: 0,
    timerEnd: 0,
    resultTime: 0,
    classGold: 'rankGold',
    classSilver: 'rankSilver',
    classCopper: 'rankCopper'
  },
  mounted() {
    axios
      .get('./static/json/quiz.json')
      .then(response => { this.info = response.data.quiz })
  },
  methods: {
    createQuiz: async function (value) {
      var sound = document.getElementById('vueSound').value;
      if (sound == 'True') {
        const opening_checkbox = new Audio("./static/sound/sound_effect/opening_checkbox.mp3");
        opening_checkbox.play();
      }
      this.selectQuizNum = value
      if (value == 2) {
        this.NationalFlagCheck = true
      }
      await this.getQuizDataJSON()
      this.createArr()
      this.shuffleArr()
      this.quizNumArr = this.quizNumArr.slice(0, 10)
      this.getQuizDataDetail()
      this.pageMove_selectQuiz2askQuestion()
      this.timerStart = performance.now()
    },
    getQuizDataJSON: async function () {
      let ret = null
      await axios
        .get('./static/json/' + this.info[this.selectQuizNum].quizName + '.json')
        .then(response => { this.quiz = response.data })
      return ret
    },
    createArr: function () {
      var i = 0
      this.quizNumArr.splice(0, this.quizNumArr.length)
      for (i = 0; i < 37; i++){
        this.quizNumArr.push(i)
      }
    },
    shuffleArr: function () {
      var n = 37
      var temp = 0
      var j = 0
      var arr = this.quizNumArr
      while (n) {
        j = Math.floor(Math.random() * n--)
        temp = arr[n]
        arr[n] = arr[j]
        arr[j] = temp
      }
    },
    getQuizDataDetail: function () {
      var quizGet = this.quiz[this.info[this.selectQuizNum].quizName][this.quizNumArr[this.questionNumUse]]
      if (this.info[this.selectQuizNum].quizName != 'NationalFlag') {
        this.question = quizGet.question
      } else {
        var NationalFlagArr = quizGet.question.split(',')
        this.question = NationalFlagArr[0]
        this.NationalFlagImg = NationalFlagArr[1]
      }
      this.option1 = quizGet.option1
      this.option2 = quizGet.option2
      this.option3 = quizGet.option3
      this.option4 = quizGet.option4
      this.answerNum = quizGet.answerNum
      this.answerText = quizGet.answerText
    },
    nextQuestion: async function () {
      this.optionBtnDisabled = false
      this.nextQuizBtnDisabled = true
      this.quizAnsShowControl = false
      this.questionNumUse += 1
      this.questionNumShow += 1
      if (this.questionNumUse < 10) {
        this.getQuizDataDetail()
      } else {
        this.timerEnd = performance.now();
        // resultTimeミリ秒
        this.resultTime = this.timerEnd - this.timerStart
        this.pageMove_askQuestion2yourResult()
        await this.ajaxGetRanking()
        this.resetQuizPlayData()
      }
    },
    judgeSelectAnswer: function (ans) {
      var sound = document.getElementById('vueSound').value;
      if (this.answerNum == ans) {
        if (sound == 'True') {
          var result = new Audio("./static/sound/quiz_voice/quiz_true.mp3");
          result.play();
        }
        this.answerImageSrc = 'true'
        this.trueCounter += 1
      } else {
        if (sound == 'True') {
          var result = new Audio("./static/sound/quiz_voice/quiz_false.mp3");
          result.play();
        }
        this.answerImageSrc = 'false'
      }
      if (this.questionNumUse == 9) {
        this.nextQuestionBtnText = '結果を見る'
      }
      this.optionBtnDisabled = true
      this.nextQuizBtnDisabled = false
      this.quizAnsShowControl = true
    },
    replaySameQuiz: function () {
      this.pageMove_yourResult2askQuestion()
      this.resetQuizPlayData()
      this.createQuiz(this.selectQuizNum)
    },
    replayAnotherQuiz: function () {
      this.pageMove_yourResult2selectQuiz()
      this.resetQuizPlayData()
    },
    resetQuizPlayData: function () {
      this.questionNumUse = 0
      this.questionNumShow = 1
      this.NationalFlagCheck = false
      this.trueCounter = 0
      this.nextQuestionBtnText = '次の問題'
    },
    pageMove_selectQuiz2askQuestion: function () {
      this.selectQuiz = false
      this.quizNameOption = false
      this.askQuestion = true
      this.quizAnswerOption = true
    },
    pageMove_askQuestion2yourResult: function () {
        this.askQuestion = false
        this.quizAnswerOption = false
        this.yourResult = true
        this.resultRanking = true
        var sound = document.getElementById('vueSound').value;
        if (sound == 'True') {
          if (this.trueCounter == 10) {
            var result = new Audio("./static/sound/quiz_voice/quiz_perfect.mp3");
            result.play();
          } else if(this.trueCounter < 10 && this.trueCounter > 5) {
            var result = new Audio("./static/sound/quiz_voice/quiz_good.mp3");
            result.play();
          } else {
            var result = new Audio("./static/sound/quiz_voice/quiz_bad.mp3");
            result.play();
          }
        }
    },
    pageMove_yourResult2askQuestion: function() {
      this.yourResult = false
      this.resultRanking = false
      this.askQuestion = true
      this.quizAnswerOption = true
    },
    pageMove_yourResult2selectQuiz: function () {
      this.yourResult = false
      this.resultRanking = false
      this.selectQuiz = true
      this.quizNameOption = true
    },
    ajaxGetRanking: function () {
      var trueCounterPost = this.trueCounter
      var quizNamePost = this.info[this.selectQuizNum].quizName
      var json_text = {
        trueCounter: trueCounterPost,
        playTime: this.resultTime,
        quizName: quizNamePost
      }
      var num = this.resultTime / 1000
      var ans = (Math.round(num * 100)) / 100
      this.resultTime = ans
      //JSONにエンコード
      var postMessage = JSON.stringify(json_text);
      let self = this;
      $.ajax("/quiz/ajax", {
        type: "post",
        data: postMessage,
        dataType: "json",
      }).done(function (data) {
        console.log("Ajax通信 成功");
        const getData = JSON.parse(data.values)
        self.ranking = getData
        self.trueCounter = trueCounterPost
      }).fail(function (data) {
        console.log("Ajax通信 失敗");
      })
    },
    rankCheckClass: function (rank) {
      if (rank === 1) {
        return this.classGold;
      } else if (rank === 2) {
        return this.classSilver;
      } else if (rank === 3) {
        return this.classCopper;
      } else {
        return
      }
    }
  }
});
