import styled from 'styled-components';

interface ElementProps {
    readonly size: 'small' | 'default';
}

interface LabelProps extends
    React.HTMLAttributes<HTMLLabelElement>,
    ElementProps {

}

export const Label = styled.label`
    color: inherit;
`;

export const Layout = styled.div`
    height: 100%;
`;

export const Text = styled.span`
    color: inherit;
`; 