import React, {Component,} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  TouchableHighlight,
  // ProgressBarAndroid,
  // Animated,
  Dimensions,
  Image,
  AsyncStorage,
  SafeAreaView,
} from 'react-native';
import Pie from 'react-native-pie';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  LocaleConfig,
} from 'react-native-calendars';
import {serverUrl} from '../../../constants';

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

export default class Record extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dateTime: {
        year: year,
        month: month,
        date: date,
        day: day,
      },
      whatInfo: false,
      dayMenus: {},
      TotalCal: 0,
      modalVisible: false,
    };
  }
  componentDidMount() {
    this.onRecord();
  };
  onRecord = async () => {
    const token = await AsyncStorage.getItem('auth-token');
    this.setState({
      token: token,
      whatInfo: false,
      TotalCal: 0,
      modalVisible: false,
    });
    this.onFetch(year, month, date, day);
    this.getbasal();
  };
  getEndOfDay = (y, m) => {
    switch (m) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        return 31;
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
      case 2:
        if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
          return 29;
        } else {
          return 28;
        }
      default:
        return 0;
    }
  };

  yesterday = (year, month, date, day) => {
    if (date !== 1) {
      date--;
    } else {
      month--;
      if (month === 0) {
        month = 12;
        year--;
      }
      date = this.getEndOfDay(year, month);
    }
    day--;
    if (day === -1) {
      day = 6;
    }
    this.onFetch(year, month, date, day);
  };

  tomorrow = (year, month, date, day) => {
    var endDate = this.getEndOfDay(year, month);
    if (date !== endDate) {
      date++;
    } else {
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      date = 1;
    }
    day++;
    if (day === 7) {
      day = 0;
    }
    this.onFetch(year, month, date, day);
    this.getbasal();
  };

  getbasal = () => {
    fetch(`${serverUrl}accounts/getbasal/`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          basal: response,
        });
      })
      .catch((err) => console.error(err));
  };

  onFetch = (year, month, date, day) => {
    this.setState({
      dateTime: {
        ...this.state.dateTime,
        year: year,
        month: month,
        date: date,
        day: day,
      },
    });
    var newYear = this.pad(`${year}`, 4);
    var newMonth = this.pad(`${month}`, 2);
    var newDate = this.pad(`${date}`, 2);
    var sendDate = `${newYear}-${newMonth}-${newDate}`;
    fetch(`${serverUrl}gallery/getChart/${sendDate}`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          dayMenus: response['Menus'],
          TotalCal: response['TotalCal'],
        });
      })
      .catch((err) => console.error(err));
  };

  touchCalbox = (key, tf) => {
    var calboxObj = this.state.dayMenus;
    calboxObj[key]['flag'] = tf;
    this.setState({
      dayMenus: calboxObj,
    });
  };

  minusCnt = (year, month, date, day, cnt, menu2food_id) => {
    if (cnt <= 1) {
      this.setModalVisible(true, year, month, date, menu2food_id);
    } else {
      var form = new FormData();
      form.append('menu2food_id', menu2food_id);
      fetch(`${serverUrl}gallery/minusCnt/`, {
        method: 'POST',
        body: form,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Token ${this.state.token}`,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          this.onFetch(year, month, date, day);
        })
        .catch((err) => console.error(err));
    }
  };

  plusCnt = (year, month, date, day, menu2food_id) => {
    var form = new FormData();
    form.append('menu2food_id', menu2food_id);
    fetch(`${serverUrl}gallery/plusCnt/`, {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Token ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        this.onFetch(year, month, date, day);
      })
      .catch((err) => console.error(err));
  };

  setModalVisible = (visible, year, month, date, menu2food_id) => {
    this.setState({
      modalVisible: visible,
      modal_year: year,
      modal_month: month,
      modal_date: date,
      modal_menu2food_id: menu2food_id,
    });
  };

  delMenu = () => {
    var form = new FormData();
    form.append('menu2food_id', this.state.modal_menu2food_id);
    fetch(`${serverUrl}gallery/deleteMenu/`, {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Token ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        this.setModalVisible(!this.state.modalVisible);
        this.onFetch(year, month, date, day);
      })
      .catch((err) => console.error(err));
  };

  pad = (n, width) => {
    n = n + '';
    return n.length >= width
      ? n
      : new Array(width - n.length + 1).join('0') + n;
  };

  getDayInfo = () => {
    const YMD = `${this.state.dateTime.year}-${this.state.dateTime.month}-${this.state.dateTime.day}`;
    fetch(`${serverUrl}gallery/`, {
      method: 'GET',
      body: YMD,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${this.state.authToken}`,
      },
    })
      .then(() => {
      })
      .catch((error) => console.log(error));
  };
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}>
          <View
            style={{
              width: '100%',
              height: height,
              backgroundColor: 'black',
              opacity: 0.5,
            }}></View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{marginBottom: 20}}>식단을 삭제하시겠습니까?</Text>
              <View style={{flexDirection:'row', justifyContent: 'space-between'}}>
                <TouchableHighlight
                  style={{...styles.modalButton, backgroundColor: '#FCA652'}}
                  onPress={() => {
                    this.delMenu();
                  }}>
                  <Text style={styles.textStyle}>삭제</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  style={{...styles.modalButton, backgroundColor: '#FCA652'}}
                  onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }}>
                  <Text style={styles.textStyle}>취소</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
        <ScrollView style={{width: '100%'}}>
          <View style={styles.chartArea}>
            {/* 여기는 요일 */}
            <View style={styles.chartDay}>
              <Icon
                name="chevron-back-outline"
                style={styles.chartDayicon}
                onPress={() =>
                  this.yesterday(
                    this.state.dateTime.year,
                    this.state.dateTime.month,
                    this.state.dateTime.date,
                    this.state.dateTime.day,
                  )
                }></Icon>
              <View style={styles.chartDaybox}>
                <Text style={styles.chartDaytxt}>
                  {this.state.dateTime.month}월 {this.state.dateTime.date}일 (
                  {
                    LocaleConfig.locales['fr'].dayNames[
                      this.state.dateTime.day
                    ]
                  }
                  )
                </Text>
              </View>
              <Icon
                name="chevron-forward-outline"
                style={styles.chartDayicon}
                onPress={() =>
                  this.tomorrow(
                    this.state.dateTime.year,
                    this.state.dateTime.month,
                    this.state.dateTime.date,
                    this.state.dateTime.day,
                  )
                }></Icon>
            </View>
            {/* 여기는 총 칼로리*/}
            <Text style={styles.caltxt}>
              {this.state.TotalCal}/{this.state.basal}
            </Text>
            {this.state.TotalCal / this.state.basal < 1 && (
              <View style={styles.progressBar}>
                {/* <Animated.View
                  style={
                    ([styles.progressBarFill],
                    {
                      backgroundColor: '#fca652',
                      width: `${
                        (this.state.TotalCal / this.state.basal) * 100
                      }%`,
                    }) //, chartwidth
                  }
                /> */}
                <View
                  style={
                    ([styles.progressBarFill],
                    {
                      backgroundColor: '#fca652',
                      width: `${
                        (this.state.TotalCal / this.state.basal) * 100
                      }%`,
                    }) //, chartwidth
                  }></View>
                <View style={styles.arrow}></View>
                <View style={styles.arrowbox}>
                  <Text style={styles.arrowboxtxt}>
                    {this.state.TotalCal}
                  </Text>
                </View>
              </View>
            )}
            {this.state.TotalCal / this.state.basal >= 1 && (
              <View style={styles.progressBar}>
                <View
                  style={
                    ([styles.progressBarFill],
                    {
                      backgroundColor: 'red',
                      width: `100%`,
                    }) //, chartwidth
                  }></View>
                <View style={styles.arrow}></View>
                <View style={styles.arrowbox}>
                  <Text style={styles.arrowboxtxt}>
                    {this.state.TotalCal}
                  </Text>
                </View>
              </View>
            )}

            {/* 여기는 영양소 */}
            <View
              style={{
                width: '100%',
                marginTop: 50,
                alignItems: 'center',
              }}>
              {Object.entries(this.state.dayMenus).map(([k, v], idx) => {
                if (Object.keys(v).length !== 0) {
                  return (
                    <>
                      {/* <Text key={idx}>{k}</Text> */}
                      <View style={styles.calbox} key={idx}>
                        <View style={styles.calboxTitle}>
                          <Icon
                            name="restaurant-outline"
                            style={{fontSize: 20, marginTop: 2}}></Icon>
                          <Text style={{fontSize: 20, marginLeft: 5}}>
                            {k}
                          </Text>
                        </View>
                        {!v.flag && (
                          <>
                            <TouchableOpacity
                              style={{
                                position: 'relative',
                                bottom: 25,
                                left: 290,
                              }}
                              onPress={() => this.touchCalbox(k, true)}>
                              <Text>차트보기</Text>
                            </TouchableOpacity>
                            {v['meal'].map((m, i) => {
                              return (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    // borderBottomWidth: 1,
                                    marginTop: 10,
                                  }}
                                  key={i}>
                                  <Text
                                    style={{fontSize: 18, marginLeft: 10}}>
                                    {m[0]}
                                  </Text>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                    }}>
                                    <Text style={{fontSize: 18}}>
                                      {m[1]}kcal
                                    </Text>
                                    <Icon
                                      name="remove-circle-outline"
                                      style={{
                                        fontSize: 20,
                                        marginTop: 2,
                                        marginLeft: 20,
                                        marginRight: 10,
                                      }}
                                      onPress={() =>
                                        this.minusCnt(
                                          this.state.dateTime.year,
                                          this.state.dateTime.month,
                                          this.state.dateTime.date,
                                          this.state.dateTime.day,
                                          m[3],
                                          m[2],
                                        )
                                      }></Icon>
                                    <Text style={{fontSize: 18}}>{m[3]}</Text>
                                    <Icon
                                      name="add-circle-outline"
                                      style={{
                                        fontSize: 20,
                                        marginTop: 2,
                                        marginHorizontal: 10,
                                      }}
                                      onPress={() =>
                                        this.plusCnt(
                                          this.state.dateTime.year,
                                          this.state.dateTime.month,
                                          this.state.dateTime.date,
                                          this.state.dateTime.day,
                                          m[2],
                                        )
                                      }></Icon>
                                  </View>
                                </View>
                              );
                            })}
                          </>
                        )}
                        {v.flag && (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignContent: 'center',
                            }}>
                            <TouchableOpacity
                              style={{
                                position: 'relative',
                                bottom: 25,
                                left: 287,
                              }}
                              onPress={() => this.touchCalbox(k, false)}>
                              <Text>수량 보기</Text>
                            </TouchableOpacity>
                            <Pie
                              radius={65}
                              sections={[
                                {
                                  percentage: v['nutrient'][0], //탄수화물
                                  color: '#FBC02D',
                                },
                                {
                                  percentage: v['nutrient'][1], //단백질
                                  color: '#FFEB3B',
                                },
                                {
                                  percentage: v['nutrient'][2], //지방
                                  color: '#FFF59D',
                                },
                              ]}
                              strokeCap={'butt'}
                            />
                            <View style={{marginTop: 20, marginLeft: 20}}>
                              <Text>
                                <Icon
                                  name="ellipse"
                                  style={{color: '#FBC02D'}}></Icon>
                                탄수화물 {v['nutrient'][0].toFixed(1)}%
                              </Text>
                              <Text>
                                <Icon
                                  name="ellipse"
                                  style={{color: '#FFEB3B'}}></Icon>
                                단백질 {v['nutrient'][1].toFixed(1)}%
                              </Text>
                              <Text>
                                <Icon
                                  name="ellipse"
                                  style={{color: '#FFF59D'}}></Icon>
                                지방 {v['nutrient'][2].toFixed(1)}%
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </>
                  );
                }
              })}
            </View>
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
    paddingTop: 20,
  },
  chartArea: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  chartDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartDayicon: {
    fontSize: 50,
  },
  chartDaybox: {
    width: '50%',
    borderWidth: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartDaytxt: {
    fontSize: 20,
    margin: 10,
  },
  calbox: {
    marginTop: 20,
    padding: 10,
    width: '90%',
    borderRadius: 5,
    elevation: 5,
    backgroundColor: 'white',
  },
  calboxTitle: {
    flexDirection: 'row',
  },
  // calchart: {},
  caltxt: {
    fontSize: 30,
    fontWeight: 'bold',
    margin: 10,
  },
  progressBar: {
    height: 20,
    width: '80%',
    backgroundColor: 'white',
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 5,
    flexDirection: 'row',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  arrow: {
    width: 15,
    height: 15,
    position: 'relative',
    top: 20,
    left: -8,
    backgroundColor: '#332c2b',
    transform: [{rotate: '45deg'}],
  },
  arrowbox: {
    width: 60,
    height: 40,
    position: 'relative',
    top: 25,
    right: 45,
    backgroundColor: '#332c2b',
    borderRadius: 3,
    justifyContent: 'center',
  },
  arrowboxtxt: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
});