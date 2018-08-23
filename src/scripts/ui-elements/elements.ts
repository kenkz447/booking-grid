import styled from 'styled-components';

interface ElementProps {
    readonly size: 'small' | 'default';
}

interface LabelProps extends
    React.HTMLAttributes<HTMLLabelElement>,
    ElementProps {

}

export const Label: React.ComponentType<LabelProps> = styled.label`
    color: inherit;
`;

export const Layout = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    flex: auto;
    height: 100%;
`;

export const Text = styled.span`
    color: inherit;
`; 