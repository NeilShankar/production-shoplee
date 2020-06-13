import React from 'react';
import clsx from 'clsx';
import { lighten, withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import HeaderBar from '../components/HeaderBar'
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Skeleton from '@material-ui/lab/Skeleton';
import InfiniteLoadingList from 'react-simple-infinite-loading'
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import Zoom from '@material-ui/core/Zoom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Link from 'next/link';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SaveIcon from '@material-ui/icons/Save';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Grow from '@material-ui/core/Grow';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SettingsIcon from '@material-ui/icons/Settings';
import AssessmentIcon from '@material-ui/icons/Assessment';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import BallotIcon from '@material-ui/icons/Ballot';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import AppsIcon from '@material-ui/icons/Apps';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import NoSsr from '@material-ui/core/NoSsr';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TuneIcon from '@material-ui/icons/Tune';
// import Debut from '../templates/TemplatePreviews/debut'
import InfoIcon from '@material-ui/icons/Info';
import DiscountHandler from '../components/bundles/DiscountHandler'
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import SearchIcon from '@material-ui/icons/Search';
import ResetProducts from '../API-instances/ResetSelectedProduct'
import Collapse from '@material-ui/core/Collapse';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import Slide from '@material-ui/core/Slide';

import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';

import BundleInstance from '../API-instances/BundleInstance'
import SelectProduct from '../API-instances/SelectProduct'
import GetBundleInstance from '../API-instances/BundleGetInstance'
import DefaultLivePreview from '../templates/HTML/1'
import Container from '@material-ui/core/Container';
import BundleCard from "../components/bundles/BundleCard";
import SPhandler from "../components/bundles/SelectProductHandler";
import RPhandler from "../components/bundles/RecommendedProductHandler"

import GetAllBundles from '../API-instances/GetAllBundles'
import InfiniteScroll from "react-infinite-scroll-component";
import SelectProductComp from '../components/bundles/SelectProduct'
import ApplySingle from '../components/bundles/ApplySingle'

import EnableUpdates from '../components/settings/EnableUpdates'
import { FixedSizeList as ReactList } from 'react-window';
import Faq from "react-faq-component";

const useData = {
    title: "Usage & Configuration",
    rows: [
        {
            title: "How do I configure and setup the Bundle Snippet on My Store?",
            content: `It's Pretty easy, copy and paste {% render 'shoplee-bundles' %} in your product template of your active theme! 
            We mostly see people put this in sections/product-template.liquid, but if you need any help you can leave us a mail at neilshankarnath@gmail.com
            or reach us through the chat, and we will try to do the best we can!`,
        },
        {
            title: "Is there a way to configure the styles of the Snippet?",
            content:
                `Surely there is! We have made a configuration panel for just for you! So that you can configure the title of the snippet, button colors etc. 
                We currently don't have much options in our configuration panel, but we promise we will be adding more as soon as we can!`,
        },
        {
            title: "There is a Bug/Error Displaying in The App",
            content: `If you feel like there is a bug/error, please report it to neilshankarnath@gmail.com or at the live chat. 
            We will definately help you to fix the bugs/errors you find, and create a better experience for you!`,
        },
        {
            title: "Can you make a custom theme for my store?",
            content: `Yes, we can make a custom snippet theme for your store, as you describe it to be!
            Just contact us at neilshankarnath@gmail.com and we will be as quick as possible to deliver the new theme for your snippet!`,
        },
    ],
};

const AntSwitch = withStyles((theme) => ({
  root: {
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(12px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: 'none',
  },
  track: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.common.white,
  },
  checked: {},
}))(Switch);


function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

var AnalysisType = "Overall"
const ColorLinearProgress = withStyles({
colorPrimary: {
    backgroundColor: '#b2dfdb',
},
barColorPrimary: {
    backgroundColor: '#00695c',
},
})(LinearProgress);

const data = {
  labels: ["3rd May", "6th May", "9th May", "12th May", "15th May", "18 May"],
  datasets: [
    {
      label: "Views",
      data: [233, 453, 385, 541, 244, 465],
      fill: true,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)"
    },
    {
      label: "Add to Cart",
      data: [133, 225, 135, 251, 254, 176],
      fill: false,
      borderColor: "#742774"
    }
  ]
};

const data2 = {
  labels: ["3rd May", "6th May", "9th May", "12th May", "15th May", "18 May"],
  datasets: [
    {
      label: "Sales",
      data: [125, 153, 185, 141, 144, 265],
      fill: true,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)"
    }
  ]
};

const options = {
  animationEnabled: true,
  responsive: true,
  maintainAspectRatio: true,
  responsiveAnimationDuration: 1000,
  theme: "dark2",
  title: {
    display: true,
    text: "Impressions and Add To Carts"
  },
  scales: {
    yAxes: [
      {
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    ]
  }
};

const options2 = {
  animationEnabled: true,
  responsive: true,
  maintainAspectRatio: true,
  responsiveAnimationDuration: 1000,
  theme: "dark2",
  title: {
    display: true,
    text: "Sales Generated"
  },
  scales: {
    yAxes: [
      {
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    ]
  }
};

const legend = {
  display: true,
  position: "bottom",
  labels: {
    fontColor: "#323130",
    fontSize: 14
  }
};


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    
    "h1": {
        "fontFamily": "\"Lato\", sans-serif",
        "fontWeight": "700",
        "fontStyle": "normal",
        "color": "#98c23d",
        "fontSize": "32px"
    },
    "content": {
        "width": "80%",
        "padding": "0 60px 0 0",
        "margin": "0 auto"
    },
    "centerplease": {
        "margin": "0 auto",
        "maxWidth": "270px",
        "fontSize": "40px"
    },
    "question": {
        "color": "#fff",
        "position": "relative",
        "background": "#98c23d",
        "margin": "0",
        "padding": "10px 10px 10px 50px",
        "display": "block",
        "width": "100%",
        "cursor": "pointer"
    },
    "answers": {
        "fontWeight": "300",
        "background": "#f2f2f2",
        "padding": "0px 15px",
        "margin": "0px 0",
        "height": "0",
        "overflow": "hidden",
        "zIndex": "-1",
        "position": "relative",
        "opacity": "0",
        "WebkitTransition": ".7s ease",
        "MozTransition": ".7s ease",
        "OTransition": ".7s ease",
        "transition": ".7s ease"
    },
    "questions_checked____answers": {
        "height": "auto",
        "opacity": "1",
        "padding": "15px"
    },
    "plus": {
        "color": "#fff",
        "position": "absolute",
        "marginLeft": "10px",
        "marginTop": "5px",
        "zIndex": "5",
        "fontSize": "2em",
        "lineHeight": "100%",
        "WebkitUserSelect": "none",
        "MozUserSelect": "none",
        "MsUserSelect": "none",
        "OUserSelect": "none",
        "userSelect": "none",
        "WebkitTransition": ".3s ease",
        "MozTransition": ".3s ease",
        "OTransition": ".3s ease",
        "transition": ".3s ease"
    },
    "questions_checked____plus": {
        "WebkitTransform": "rotate(45deg)",
        "MozTransform": "rotate(45deg)",
        "OTransform": "rotate(45deg)",
        "transform": "rotate(45deg)"
    },
    "questions": {
        "display": "none"
    },      
  inputRoot: {
    padding: '2px 4px',
    display: 'flex',
    float: "left",
    alignItems: 'center',
    width: 1000,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  root: {
    display: 'flex',
    flexGrow: 1,
  },
  titleTextColor: "blue",
  rowTitleColor: "blue",
  margin: {
    margin: theme.spacing(1),
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));



export default function FrequentlyBought() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [bundleTitle, setBundleTitle] = React.useState('Frequently Bought Products')
  const [bundleTheme, setBundleTheme] = React.useState(1)

  const [ProductTitle, setProductTitle] = React.useState('')
  const [ProductPrice, setProductPrice] = React.useState('')
  const [ProductImage, setProductImage] = React.useState('')

  const [Product1Image, setProduct1Image] = React.useState('')
  const [Product1Price, setProduct1Price] = React.useState('')
  const [Product1Title, setProduct1Title] = React.useState('')

  const [TotalPrice, setTotalPrice] = React.useState('')

  const anchorRef = React.useRef(null);
  const [MenuOpen, setMenuOpen] = React.useState(false);
  const [PrevDisplay, setPrevDisplay] = React.useState('none');

  const [hasMore, setHasMore] = React.useState([true])
  const [ bundles, setBundles ] = React.useState([])

  const [ DisplayBundles, setDisplayBundles ] = React.useState([])
  const [ oriBundles, setOriBundles ] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [totalPage, setTotalPage] = React.useState(1)

  const [displayProgress, setDisplayProgress] = React.useState('none');
  const bull = <span className={classes.bullet}>•</span>;
  const [save, saveOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(false)
  const [discountAll, setDiscountAll] = React.useState(0)
  const [search, setSearch] = React.useState({
    term: "",
    items: [],
    timeout: 0,
    searching: false
  })
  const [loaded, setLoaded] = React.useState(false)
  const [searchTimeout, setSearchTimeout] = React.useState(0)

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClickUser = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUser = () => {
    setAnchorEl(null);
  };


  const saveSuccess = () => {
    saveOpen(true);
  };


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setMenuOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(MenuOpen);
  React.useEffect(() => {
    if (prevOpen.current === true && MenuOpen === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = MenuOpen;
  }, [MenuOpen]);

  const [designTheme, setDesignTheme] = React.useState('10');

  const handleChange = (event) => {
    setDesignTheme(event.target.value);
  };

  const changeDiscAll = (discountValue) => {
    discountRef.current.changeDiscountsForAll(discountValue)
    setDisplayProgress('block')
    setChecked(false)
  }

  const styles = {
    // bgColor: 'white',
    titleTextColor: "blue",
    rowTitleColor: "blue",
    // rowContentColor: 'grey',
    // arrowColor: "red",
};
  const sProd = React.useRef()
  return (
  
    <NoSsr>
    <div className={classes.root}>
    <CssBaseline />
      <ColorLinearProgress style={{ display: displayProgress, margin: "0", position: "fixed", top: "0px", width: "100%", zIndex: "9999" }} className={classes.margin} />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >          
        <Toolbar>        
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Privacy Policy
          </Typography>
          <IconButton style={{"position":"absolute","right":"33px","fontSize":"2.5em"}} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClickUser}>
           <AccountCircleRoundedIcon style={{ color: "white" }} />
          </IconButton>
          {/* <Typography style={{"position":"absolute","right":"33px","fontSize":".6em"}} variant="h6"><b>{user.name}</b></Typography> */}
          <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleCloseUser}
          >
          <MenuItem onClick={handleCloseUser}><Link href="/settings" shallow={true}>Account</Link></MenuItem>
          <MenuItem onClick={handleCloseUser}><Link href="/dashboard" shallow={true}>Dashboard</Link></MenuItem>
          <MenuItem onClick={handleCloseUser}><Link href="/bundle-configuration" shallow={true}>Configure</Link></MenuItem>
          <MenuItem onClick={handleCloseUser}><Link href="/bundles" shallow={true}>View Bundles</Link></MenuItem>
          </Menu>
          {/* pagename */}
        </Toolbar>
        
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        style={{
          "background":"#313140",
          "color":"white"
        }}
      >
        <div className={classes.toolbar}>
        <img style={{"height":"37px"}} src="https://cdn.shopify.com/s/files/1/0278/4611/5389/t/1/assets/SHOP.png?v=1591108196" alt=""/>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon style={{ color: "white" }}/> : <ChevronLeftIcon style={{ color: "white" }}/>}
          </IconButton>
        </div>
        <br />
        <Typography variant="h5" style={{ paddingLeft: "10px", display: ((open === true) ? 'block' : 'none'), fontSize: ".8em", fontWeight: "bold" }}>Main</Typography>
        <Divider />
        <List>
        <ListItem button key={"Dashboard"}>
            <Link href="/dashboard" shallow={true}>
              <ListItemIcon><AssessmentIcon style={{ color: "white" }} /></ListItemIcon>
            </Link>
            <Link href="/dashboard" shallow={true}>
              <ListItemText primary={"Dashboard"} />
            </Link>
          </ListItem>     
           
          <ListItem button key={"Configurations"} style={{ display: (firstTime === true) ? 'none' : 'flex' }}>
            <Link href="/bundle-configuration" shallow={true}>
              <ListItemIcon><TuneIcon style={{ color: "white" }} /></ListItemIcon>
            </Link>
            <Link href="/bundle-configuration" shallow={true}>
              <ListItemText primary={"Configurations"} />
            </Link>
          </ListItem>     

          <ListItem button key={"Bundles"} style={{ display: (firstTime === true) ? 'none' : 'flex' }}>
            <Link href="/bundles" shallow={true}>
              <ListItemIcon><AddShoppingCartIcon style={{ color: "white" }} /></ListItemIcon>
            </Link>
            <Link href="/bundles" shallow={true}>
              <ListItemText primary={"Bundles"} />
            </Link>
          </ListItem>     
        </List>
        <br />
        <Typography variant="h5" style={{ paddingLeft: "10px", display: ((open === true) ? 'block' : 'none'), fontSize: ".8em", fontWeight: "bold" }}>Info</Typography>
        <Divider />
        <List>
        <ListItem button key={"Settings"}>
          <Link href="/settings" shallow={true}>
            <ListItemIcon><SettingsIcon style={{ color: "white" }} /></ListItemIcon>
          </Link>
          <Link href="/settings" shallow={true}>
            <ListItemText primary={"Settings"} />
          </Link>
        </ListItem>       
        <ListItem button key={"FAQ"}>
          <Link disabled={firstTime} href="/frequently-asked-questions" shallow={true}>
            <ListItemIcon><LiveHelpIcon style={{ color: "white" }} /></ListItemIcon>
          </Link>
          <Link href="/frequently-asked-questions" shallow={true}>
            <ListItemText primary={"FAQ"} />
          </Link>
        </ListItem>        
        </List>
      <a href={process.env.REACT_APP_SHOPIFYAPPURL}><img style={{ position: absolute, bottom: 0 }} src="https://cdn.shopify.com/s/files/1/0278/4611/5389/t/1/assets/We_Promise_It_Won_t_Take_More_Than_2_Minutes_To_Leave_a_Review.png?v=1592048359" alt="" /></a>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Grid container>
            <Paper elevation={15} style={{ padding: "1.5em" }}>
                <h2>Privacy Policy</h2>
                <p>Your privacy is important to us. It is Shoplee Bundles' policy to respect your privacy regarding any information we may collect from you across our website, <a href="https://bundles-shoplee-app.herokuapp.com">https://bundles-shoplee-app.herokuapp.com</a>, and other sites we own and operate.</p>
                <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
                <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification.</p>
                <p>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
                <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
                <p>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.</p>
                <p>Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.</p>
                <p>This policy is effective as of 9 June 2020.</p>
            </Paper>
        </Grid>
        <br></br><Divider /><br></br>
        <Grid container>
          <Paper elevation={20} style={{"padding":"2em","textAlign":"center","margin":"0 17%"}}>
            <Typography variant="h5">Support Our App On Shopify App Store!</Typography>
            <Typography variant="caption">Your support would mean alot to us, so could you please place a review for our app at Shopify App Store? If you need any other kind of support from our side, we are always ready to help!</Typography>
            <br/><br/><Button style={{"background":"black","color":"white"}} variant="contained" ><a style={{ color: "white" }} href={process.env.REACT_APP_SHOPIFYAPPURL}>Leave A Review</a></Button>
          </Paper>
        </Grid>
        <br></br><br></br>
      </main>
    </div>
    </NoSsr>
  );
}
