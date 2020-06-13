import React from 'react';
import clsx from 'clsx';
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Link from 'next/link'

const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1),
        width: '25ch',
      },
    },
    textField: {
        width: '25ch',
    }
}));
  

export default function Installation() {
const [fullUrl, setFullUrl] = React.useState("")

const handleChange = (e) => {
    setFullUrl(`${process.env.REACT_APP_HOST}/auth?shop=${e.target.value}`)
}

const classes = useStyles();
  return (
    <>
    <div style={{"margin":"auto","width":"50%","marginTop":"9%", textAlign: "center", color: "white"}}>
        <h1>Welcome To ShopLee!</h1>
        <h4>If You haven't already installed our app, please enter your store URL in the below box and We'll install ShopLee in your store!</h4>
        <br />
        <form className={classes.root} noValidate autoComplete="off">
            <TextField onChange={handleChange} className={classes.textField} id="standard-basic" variant="filled" label="Your Shop Url Here" />
        </form>
        <br />
        <Button variant="contained"><a style={{ color: "black" }} href={fullUrl}>Install</a></Button>
    </div>
     <div style={{"margin":"auto","width":"50%","marginTop":"9%", textAlign: "center", color: "white"}}>
        <h4>If you already have Installed our App, please login to your store dashboard and head to the Apps Area, and then click on Shoplee bundles App to login!</h4>
    </div>
    </>
  );
}
