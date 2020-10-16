import React, {Component} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  AsyncStorage,
  SafeAreaView,
} from 'react-native';
import {
  CalendarList,
  Agenda,
  LocaleConfig,
  Arrow,
} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';

// const serverUrl = 'http://localhost:8080/';
const serverUrl = 'http://10.0.2.2:8080/';
// const serverUrl = 'http://j3a410.p.ssafy.io/api/';

const {width, height} = Dimensions.get('screen');

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
  monthNamesShort: [
    'Janv.',
    'Févr.',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = 'fr';

let today = new Date();
let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1; // 월
let date = today.getDate(); // 날짜
let day = today.getDay(); // 요일

export default class Calendar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDate: {
        date: null,
        아침: 0,
        점심: 0,
        저녁: 0,
        간식: 0,
        야식: 0,
        총합: 0,
      },
      nextDays: {},
    };
  }
  componentDidMount() {
    this.onCalendar();
  };
  onCalendar = async () => {
    const token = await AsyncStorage.getItem('auth-token');
    fetch(`${serverUrl}gallery/getCalendar/`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          nextDays: response,
        });
        var tempObject = {};
        for (var key of Object.keys(this.state.nextDays)) {
          tempObject = {
            ...tempObject,
            [key]: {
              marked: true,
              dotColor: '#FCA652',
            },
          };
        }
        this.setState({
          newDaysObject: tempObject,
        });
      })
      .catch((err) => console.error(err));
  };
  onMacro = (day) => {
    if (Object.keys(this.state.nextDays).includes(day.dateString)) {
      this.setState({
        selectedDate: {
          ...this.state.selectedDate,
          date: day.dateString,
          아침: this.state.nextDays[day.dateString][0],
          점심: this.state.nextDays[day.dateString][1],
          저녁: this.state.nextDays[day.dateString][2],
          간식: this.state.nextDays[day.dateString][3],
          야식: this.state.nextDays[day.dateString][4],
          총합: this.state.nextDays[day.dateString][5],
        },
      });
    } else {
      this.setState({
        selectedDate: {
          ...this.state.selectedDate,
          date: day.dateString,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0,
          total: 0,
        },
      });
    }
  };
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={{width: '100%'}}>
          <View style={styles.calendarArea}>
            <CalendarList
              horizontal={true}
              pagingEnabled={true}
              // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
              minDate={'2020-01-01'}
              // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
              maxDate={'2022-12-31'}
              // Handler which gets executed on day press. Default = undefined
              onDayPress={(day) => {
                this.onMacro(day);
              }}
              // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
              monthFormat={'yyyy MM'}
              // Handler which gets executed when visible month changes in calendar. Default = undefined
              onMonthChange={(month) => {
                console.log('month changed', month);
              }}
              // Hide month navigation arrows. Default = false
              hideArrows={true}
              // Replace default arrows with custom ones (direction can be 'left' or 'right')
              renderArrow={(direction) => <Arrow />}
              // Do not show days of other months in month page. Default = false
              hideExtraDays={true}
              // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
              // day from another month that is visible in calendar page. Default = false
              disableMonthChange={true}
              // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
              firstDay={1}
              // Hide day names. Default = false
              hideDayNames={false}
              // Show week numbers to the left. Default = false
              showWeekNumbers={false}
              // Handler which gets executed when press arrow icon left. It receive a callback can go back month
              onPressArrowLeft={(subtractMonth) => subtractMonth()}
              // Handler which gets executed when press arrow icon right. It receive a callback can go next month
              onPressArrowRight={(addMonth) => addMonth()}
              // Disable left arrow. Default = false
              disableArrowLeft={true}
              // Disable right arrow. Default = false
              disableArrowRight={true}
              // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
              disableAllTouchEventsForDisabledDays={true}
              // Replace default month and year title with custom one. the function receive a date as parameter.
              // renderHeader={(date) => {/*Return JSX*/}}
              // Enable the option to swipe between months. Default = false
              enableSwipeMonths={true}
              theme={{
                todayTextColor: '#FCA652',
                backgroundColor: '#FFFBE6',
              }}
              markedDates={this.state.newDaysObject}
            />
            {Object.keys(this.state.nextDays).includes(
              this.state.selectedDate.date,
            ) && (
              <View style={styles.dateBox}>
                <Text style={{textAlign: 'center', fontSize: 25}}>
                  {this.state.selectedDate.date}
                </Text>
                {Object.entries(this.state.selectedDate)
                  .filter(([key, value]) => key !== 'date')
                  .map(([key, value], i) => {
                    if (key !== '총합') {
                      return (
                        <View style={styles.macroBox} key={i}>
                          <Text style={styles.macroTxt}>{key}</Text>
                          <Text style={styles.macroTxt}>
                            {value}
                            {'   '}kcal
                          </Text>
                        </View>
                      );
                    } else if (key === '총합') {
                      return (
                        <View
                          style={[styles.macroBox, {fontWeight: 'bold'}]}
                          key={i}>
                          <Text
                            style={[styles.macroTxt, {fontWeight: 'bold'}]}>
                            {key}
                          </Text>
                          <Text
                            style={[styles.macroTxt, {fontWeight: 'bold'}]}>
                            {value}
                            {'   '}kcal
                          </Text>
                        </View>
                      );
                    }
                  })}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: height,
    flex: 1,
    backgroundColor: '#FFFBE6',
  },
  dateBox: {
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    paddingVertical: 10,
  },
  macroBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginHorizontal: 10,
  },
  macroTxt: {
    fontSize: 20,
    fontFamily: 'BMHANNAAir',
    color: '#232323',
    paddingTop: 20,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  calendarArea: {
    width: '100%',
    marginBottom: 30,
  },
});
