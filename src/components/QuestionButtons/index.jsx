import { View, Text, Image } from '@tarojs/components'
import './index.less'
const answerQuestionImg = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/answer-question.png'
const submitQuestionImg = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/submit-question.png'

export default function QuestionButtons({ onAskQuestion, onAnswerQuestion }) {
  return (
    <View className="question-action-bar">
      <View className="action-button ask-button" onClick={onAskQuestion}>
        <Image className="button-icon" src={submitQuestionImg} mode="aspectFit" />
        <Text className="button-text">提个问题</Text>
      </View>
      <View className="action-button answer-button" onClick={onAnswerQuestion}>
        <Image className="button-icon" src={answerQuestionImg} mode="aspectFit" />
        <Text className="button-text">回答问题</Text>
      </View>
    </View>
  )
}
