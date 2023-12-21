import { useState } from 'react';



export const httpGet = async (url) => {
  console.log("HTTP GET: " + url);
  const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },

  };

  return new Promise ((resolve, reject) => {
    fetch(url + '?format=json', requestOptions)
        .then( (response) => {
            if ([200, 204].includes(response.status)){
                response.json().then((data) => {
                    resolve(data);
                })
            }else {
                reject({error: "Bad response: " + response.status})
            }

        //Network / socket related errors
        }).catch ((errmsg) => {
          reject({error: errmsg.toString() });
        });

  });


  

}

export const httpPost = async (url, data) => {
  console.log("HTTP POST: " + url, data);
  const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(data)

  };

  return new Promise ((resolve, reject) => {
    fetch(url + '?format=json', requestOptions)
        .then( (response) => {
          if ([200, 201].includes(response.status)){
            response.json().then((data) => {
                resolve(data);
            })
          }else {
            reject({error: "Bad response: " + response.status});
          }

        //Network / socket related errors
        }).catch ((errmsg) => {
          reject({error: errmsg.toString() });
        });

  });



}


//Fix all the update functions
export const httpPut = async (url, data) => {
 console.log("HTTP PUT: " + url, data);
 const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(data)

  };
    
  return new Promise ((resolve, reject) => {
    fetch(url + '?format=json', requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            response.json().then((data) => {
                resolve(data);
            })
          }else {
            reject({error: "Bad response: " + response.status});
          }

        //Network / socket related errors
        }).catch ((errmsg) => {
          reject({error: errmsg.toString() });
        });

  });

}


export const httpDelete = async (url) => {
  const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
  };

  return new Promise ((resolve, reject) => {
    fetch(url + "?format=json", requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
                resolve(); 
          }else {
                reject({error: "Bad response: " + response.status});
            }

        //Network / socket related errors
        }).catch ((errmsg) => {
          reject({error: errmsg.toString() });
        });

  });


}

export function swap(arr,xp, yp)
{
    var temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
}


export function selectionSortArr(arr,  n){
    var i, j, min_idx;

    // One by one move boundary of unsorted subarray
    for (i = 0; i < n-1; i++)
    {
        // Find the minimum element in unsorted array
        min_idx = i;
        for (j = i + 1; j < n; j++)
        if (arr[j] > arr[min_idx])
            min_idx = j;

        // Swap the found minimum element with the first element
        swap(arr,min_idx, i);

    }
}

export function selectionSort(keys, arr,  n){
    var i, j, min_idx;

    // One by one move boundary of unsorted subarray
    for (i = 0; i < n-1; i++)
    {
        // Find the minimum element in unsorted array
        min_idx = i;
        for (j = i + 1; j < n; j++)
        if (arr[j] > arr[min_idx])
            min_idx = j;

        // Swap the found minimum element with the first element
        swap(arr,min_idx, i);
        swap(keys,min_idx, i);

    }
}





export const getDateStrFormat = (dateObj) => {
  return `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()}`;
}

//Converts floating point hours to a military-time string, 4.5 -> 04:30
export const hoursToTimeStr = (n) => {
  let h = Math.floor(n);

  //Convert hour-decimal to minutes
  let m = (n - h)*60;


  // If decimalis above 0.5 it means we round upwards, usually it's 0.99998
  // while if its under, it's usually 0.0000000001
  if ((m - Math.floor(m)) > 0.5){
    m = Math.ceil(m);
  }else {
    m = Math.floor(m);
  }


  let hour, minute;

  if ((h > 24) || (h == 24 && m > 0))
  {
    h = 0;
  }

  if (h < 10){
    hour = `0${h}`;
  }else {
    hour = `${h}`;
  }

  if (m == 0){
    minute = "00";
  }
  if (m < 10){
    minute = `0${m}`;
  }else {
    minute = `${m}`;
  }

  return `${hour}:${minute}`;

}

//Converts military-time into floating point hours, 16:45 -> 16.75
export const timeStrToHours = (val) => {
  let err;
  let hm = val.split(":");
  //Display error message
  if (hm.length != 2){
    err = true;
  }else {
    let hour = hm[0];
    let minute = hm[1];
    let h, m;
    let hFloat;

    for (let i = 0; i < hour.length; i++)
    {
      let char = hour[i];
      if (isNaN(char)){
        err = true;
      }
    }


    for (let i = 0; i < minute.length; i++)
    {
      let char = minute[i];
      if (isNaN(char)){
        err = true;
      }
    }

    if (hour[0] == '0')
    {
      h = parseInt(hour[1]);
    }else {
      h = parseInt(hour);
    }

    if (minute[0] == '0')
    {
      m = parseInt(minute[1]);
    }else {
      m = parseInt(minute);
    }

    hFloat = h + (m/60);
    if (err)
    {
      hFloat = 0.0;
    }

    return hFloat;
  }


}


export function useForceUpdate(){
    const [value, setValue] = useState(0);
    return () => setValue(value => value + 1);
}
