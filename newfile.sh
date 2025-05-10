#!/bin/bash

echo WHo are you : ?
read WHO

checkwho(){
   if [ $WHO = herbert ] ;then
     echo "Welcome"
else
     echo "You are not wecome"
fi

case $WHO in 
     mich)
       echo "You are an intruder"
       ;;
     *)
       echo "You are not an intruder"
esac
count=$(wc -c <<< $WHO)
cat << EOF
---- Counted the WOrds
---- logging result
----- $count
EOF
}

checkwho
 
